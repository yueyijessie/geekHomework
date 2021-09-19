// const { match } = require('assert');
const css = require('css') // 导入css包

const EOF = Symbol('EOF'); // EOF: end of file

const layout = require('./layout.js')

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{type:"document", children:[]}];

// 加入一个新的函数addCSSRules，这里我们把css规则暂存到一个数组里
let rules = []
function addCSSRules(text) {
    var ast = css.parse(text); // 分析css规则
    console.log(JSON.stringify(ast, null, "     "));  // 研究一下css规则格式
    rules.push(...ast.stylesheet.rules);
}

// div .a 复合选择器
function match(element, selector) {
    // 仅处理简单选择器
    if (!selector || !element.attributes) {
        return false;
    }

    if(selector.charAt(0) === '#') {
        // id选择器
        var attr = element.attributes.filter(attr => attr.name === "id")[0]
        if (attr && attr.value === selector.replace("#", '')) {
            return true;
        }
    } else if (selector.charAt(0) === '.') {
        // class选择器
        var attr = element.attributes.filter(attr => attr.name === "class")[0]
        if (attr && attr.value === selector.replace(".", '')) {
            return true;
        }
    } else {
        // tagName选择器
        if(element.tagName === selector){
            return true;
        }
    }
    return false;
}

function computeCSS(element) {
    // console.log(rules);
    // console.log("compute CSS for Element", element);
    // 必须知道元素的所有父元素才能判断元素与规则是否匹配
    var elements = stack.slice().reverse(); // stack保存的是本元素的所有父元素，标签匹配会从当前元素向外匹配，最后一个是当前元素

    if (!element.computedStyle) {
        element.computedStyle = {};
    }

    for(let rule of rules){
        // selectors是复合选择器，selectorPart里每个元素是单个元素的选择器
        var selectorParts = rule.selectors[0].split(' ').reverse(); // 选择器也要从当前元素向外排列(split参数因为我们只假设有空格，忽略< ~)

        // 当前元素和选择器进行匹配
        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        // 用循环匹配elements父元素队列
        var j = 1;
        for(var i = 0; i < elements.length; i++) {
            if (!match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }
        if(matched){
            // 一旦选择匹配，就应用选择器到元素上，形成computedStyle
            // console.log("Element", element, "matched rule", rule);
            var sp = specificity(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            for (var declaration of rule.declarations){
                if (!computedStyle[declaration.property]){
                    computedStyle[declaration.property] = {}
                }
                // computedStyle[declaration.property].value = declaration.value;
                if (!computedStyle[declaration.property].specificity){
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                }
            }
            console.log(element.computedStyle)
        }
    }
}

// css根据specificity和后来优先规则覆盖
// specificity是个四元组，越左边权重越高
// 一个css规则的specificity根据包含的简单选择器相加而成
function specificity(selector){
    var p = [0, 0, 0, 0];
    var selectorParts = selector.split(" ");
    for (var part of selectorParts){
        if (part.charAt(0) == "#") {
            p[1] += 1;
        } else if (part.charAt(0) == ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2){
    if(sp1[0] - sp2[0])
        return sp1[0] - sp2[0];
    if (sp1[1] - sp2[1])
        return sp1[1] - sp2[1];
    if(sp1[2] - sp2[2])
        return sp1[2] - sp2[2];

    return sp1[3] - sp2[3];
}

function emit(token) {
    let top = stack[stack.length - 1];

    if (token.type === "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;

        for(let p in token) {
            if (p !== "type" && p !== "tagName")
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
        }

        // 当创建一个元素后，立即计算css
        // 假设在分析元素的时候，所有css规则已经收集完，但在真实浏览器中，body标签也会有style属性，需要重新计算css的情况，这个暂时忽略
        computeCSS(element); // 在starttag计算css，一些高级选择器不会被匹配

        top.children.push(element);
        // element.parent = top;

        if (!token.isSelfClosing) {
            stack.push(element);
        }
            
        currentTextNode = null;

    } else if (token.type === "endTag") {
        if (top.tagName !== token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            // 遇到style标签，执行添加css规则的操作
            if (top.tagName === "style"){
                addCSSRules(top.children[0].content);
            }
            // flex需要知道子元素，子元素发生在结束标签之前
            layout(top);
            stack.pop();
        }
        currentTextNode = null;

    } else if (token.type === "text") { 
        if (currentTextNode === null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
    // console.log(token);
}

function data(c) {
    if (c === '<') {
        return tagOpen;
    } else if (c === EOF) {
        emit({
            type: "EOF"
        });
        return ;
    } else { // 文本
        emit({
            type: "text",
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if(c === '/') {
        return endTagOpen;  // 结束标签的开头
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c);  // 开始标签或自封闭标签
    } else {
        return ;
    }
}

function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        };
        return tagName(c);
    } else if (c == ">") {
        
    } else if (c == EOF) {
        
    } else {

    }
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {  // tab，换行，禁止，空格
        return beforeAttributeName; // 遇到空格意味着跟着html属性
    } else if (c === "/") {
        return selfClosingStartTag;  // 自封闭标签
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === ">") {
        emit(currentToken);
        return data;  // 结束开始标签
    } else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if(c === "/" || c === '>' || c === EOF){
        return afterAttributeName(c);
    } else if (c === '=') {
        
    } else { // 字符
        currentAttribute = {
            name: '',
            value: ''
        };
        return attribueName(c);
    }
}

function attribueName(c) {
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){ // 属性结束
        return afterAttributeName(c);
    } else if (c == "=") { // 进入属性值
        return beforeAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c;
        return attribueName;
    }
}

function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){ // 属性结束
        return beforeAttributeValue;
    } else if (c == "\"") { // 进入属性值
        return doubleQuotedAttributeValue;
    } else if (c == "\'") {
        return singleQuotedAttributeValue;
    } else if (c == ">") {
        // return data;
    } else {
        return unquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function unquotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)){ // 属性结束
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === "/") { // 进入属性值
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
    } else if (c === "\u0000") {
        // return data;
    } else if (c === "\"" || c === "'" || c === "<" || c === "=" || c === "`") {
        
    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return unquotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function selfClosingStartTag(c) {
    if (c === '>'){
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (c === "EOF") {

    } else {

    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value: '',
        };
        return attributeName(c);
    }
}


module.exports.parseHTML = function parseHTML(html) {
    let state = data; // 定义初始状态

    for (let c of html){
        state = state(c);
    }
    console.log(html);
    state = state(EOF);
    return stack[0];
}