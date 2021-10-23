// toyjs

import {scan} from "./LexParser.js";

// 对abnf进行结构化处理，形成语法树
let syntax = {
    Program: [["StatementList", "EOF"]], // 添加EOF代表文件结束
    StatementList: [
        ["Statement"],
        ["StatementList", "Statement"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"]
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    Expression: [
        ["AdditiveExpression"]
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"]
    ],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")", "{", "StatementList", "}"]
    ],
    ExpressionStatement: [
        ["Expression", ";"]
    ],
    AdditiveExpression: [
        ["MultiplyExpression"],
        ["AdditiveExpression", "+" , "MultiplyExpression"],
        ["AdditiveExpression", "-" , "MultiplyExpression"]
    ],
    MultiplyExpression: [
        ["PrimaryExpression"],
        ["MultiplyExpression", "*" , "PrimaryExpression"],
        ["MultiplyExpression", "/" , "PrimaryExpression"]
    ],
    PrimaryExpression: [
        ["(", "Expression", ")"],
        ["Literal"],
        ["Identifier"]
    ],
    Literal: [
        ["NumericLiteral"],
        ["StringLiteral"],
        ["BooleanLiteral"],
        ["NullLiteral"],
        ["RegularExpression"],
        ["ObjectLiteral"],
        ["ArrayLiteral"]
    ],
    ObjectLiteral: [
        ["{", "}"],
        ["{", "PropertyList", "}"]
    ],
    PropertyList: [
        ["Property"],
        ["PropertyList", ",", "Property"]
    ],
    Property: [
        ["StringLiteral", ":", "AdditiveExpression"],
        ["Identifier", ":", "AdditiveExpression"]
    ]
}

let hash = {

}

// 求closure, 把start里的program展开
function closure(state) {
    hash[JSON.stringify(state)] = state; //保存state进入hash，
    let queue = [];
    for (let symbol in state) {
        // 以dollar开头的属性，直接略过，不会被当作普通状态迁移的属性
        if (symbol.match(/^\$/)){
            return;
        }
        queue.push(symbol);
    }
    while(queue.length){
        let symbol = queue.shift();
        // console.log(symbol);
        if(syntax[symbol]){
            for (let rule of syntax[symbol]) {
                if (!state[rule[0]]) {
                    queue.push(rule[0]);
                }
                let current = state
                for(let part of rule) {
                    if (!current[part])
                        current[part] = {}
                    current = current[part];
                }
                current.$reduceType = symbol; // 添加特殊符号$来表示状态
                current.$reduceLength = rule.length;
            }
        }
    }
    for (let symbol in state) {
        // 以dollar开头，直接略过
        if (symbol.match(/^\$/)){
            return;
        }
        // 出口调用hash，判断
        if (hash[JSON.stringify(state[symbol])]){
            state[symbol] = hash[JSON.stringify(state[symbol])];
        } else {
            closure(state[symbol]);
        }  
    }
}

let end = {
    $isEnd: true // 添加特殊符号$来表示状态
}

let start = {
    "Program": end
}

closure(start);


//////////////////////////////////////////////////////
// parser

export function parse(source) {
    let stack = [start];
    let symbolStack = [];
    //
    function reduce(){
        let state = stack[stack.length - 1];
        // 产生一个non-terminal symbol， 合成reduce to non-terminal symbols
        if (state.$reduceType){
            let children = [];
            for (let i = 0; i < state.$reduceLength; i++){
                stack.pop()
                children.push(symbolStack.pop());
            }
            // create a non-terminal symbol and shift it
            return {
                type: state.$reduceType,
                children: children.reverse()
            };
        } else {
            throw new Error("unexpected token");
        }
    }
    //
    function shift(symbol) {
        let state = stack[stack.length - 1];
        if (symbol.type in state){
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
            // console.log(state)
            // state = state[symbol.type];
        } else {
            shift(reduce());
            shift(symbol);
        }
    }
    // 这里symbol都是terminal symbol
    for (let symbol of scan(source)) {
        shift(symbol);
        // console.log(symbol);
    }
    // console.log(reduce());
    return reduce();
}

let evaluator = {
    Program(node){
        console.log(node)
        return evaluate(node.children[0]);
    },
    StatementList(node) {
        console.log(node)
        if (node.children.length === 1) {
            return evaluate(node.children[0]);
        } else {
            evaluate(node.children[0]);
            return evaluate(node.children[1]);
        }
    },
    Statement(node) {
        return evaluate(node.children[0]);
    },
    VariableDeclaration(node){
        console.log("Declare varible", node.children[1].name);
    },
    ExpressionStatement(node){
        return evaluate(node.children[0]);
    },
    Expression(node){
        return evaluate(node.children[0]);
    },
    AdditiveExpression(node){
        if (node.children.length === 1)
            return evaluate(node.children[0]);
        else {
            // todo
        }
    },
    MultiplyExpression(node){
        if (node.children.length === 1)
            return evaluate(node.children[0]);
        else {
            // todo
        }
    },
    PrimaryExpression(node){
        if (node.children.length === 1)
            return evaluate(node.children[0]);
    },
    Literal(node){
        return evaluate(node.children[0]);
    },
    NumericLiteral(node) {
        let str = node.value;
        let l = str.length;
        let value = 0;
        let n = 10; // 定义进制，默认十进制
        // 匹配进制
        if(str.match(/^0b/)){
            n = 2;
            l -= 2; // 长度减掉2，0b不能算进去
        } else if (str.match(/^0o/)) {
            n = 8;
            l -= 2;
        } else if (str.match(/^0x/)) {
            n = 16;
            l -= 2;
        }
        // 算数值
        while(l--){
            let c = str.charCodeAt(str.length - l - 1);
            if (c >= 'a'.charCodeAt(0)){
                c = c - 'a'.charCodeAt(0) + 10;
            } else if (c >= 'A'.charCodeAt(0)){
                c = c - 'A'.charCodeAt(0) + 10;
            } else if (c >= '0'.charCodeAt(0)){
                c = c - '0'.charCodeAt(0);
            }
            value = value * n + c
        }
        console.log(value)
        return Number(node.value);
        // return evaluate(node.children[0]);
    },
    StringLiteral(node){
        // 把字符串的真实值拿出来，去掉多余的符号；超出四个f就进行十六进制的处理
        let result = [];

        for (let i = 1; i < node.value.length - 1; i++) {
            if (node.value[i] === '\\') {
                ++ i;
                let c = node.value[i];
                let map = {
                    "\"": "\"",
                    "\'": "\'",
                    "\\": "\\",
                    "0": String.fromCharCode(0x0000),
                    "b": String.fromCharCode(0x0008),
                    "f": String.fromCharCode(0x000C),
                    "n": String.fromCharCode(0x000A),
                    "r": String.fromCharCode(0x000D),
                    "t": String.fromCharCode(0x0009),
                    "v": String.fromCharCode(0x000B)
                }
                if (c in map){
                    result.push(map[c]);
                } else {
                    result.push(c);
                }
            } else {
                result.push(node.value[i]);
            }
        }
        console.log(result);
        return result.join('');
    },
    ObjectLiteral(node){
        if(node.children.length === 2){
            return {};
        }
        if(node.children.length === 3){
            let object = new Map();
            this.PropertyList(node.children[1], object)
            // object.prototype = 
            return object;
        }
    },
    PropertyList(node, object){
        console.log(node.children)
        if(node.children.length === 1){
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    },
    Property(node, object){
        let name;
        if(node.children[0].type === 'Identifier'){
            name = node.children[0].name;
        }else if(node.children[0].type === 'StringLiteral'){
            name = evaluate(node.children[0]);
        }
        object.set(name, {
            value: evaluate(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true
        })
    }
}

// 执行语法树
function evaluate(node) {
    if (evaluator[node.type]){
        return evaluator[node.type](node);
    }
}
/////////////////////////////////////////////////

window.js = {
    evaluate, parse
};

// let source = `
//     "ab\\bc";
// `;
// let tree = parse(source);
// evaluate(tree);

// for (let symbol of scan(source)) {
//     console.log(symbol);
// }