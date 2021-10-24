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
        ["WhileStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"],
        ["Block"],
        ["BreakStatement"],
        ["ContinueStatement"]
    ],
    BreakStatement:[
        ["break", ";"]
    ],
    ContinueStatement:[
        ["continue", ";"]
    ],
    Block: [
        ["{", "StatementList", "}"],
        ["{", "}"]
    ],
    WhileStatement: [
        ["while", "(", "Expression", ")", "Statement"]
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    Expression: [
        ["AssignmentExpression"]
    ],
    // 把identifier当作lefthandsideExpression
    AssignmentExpression:[
        ["LeftHandSideExpression", "=", "LogicalORExpression"],
        ["LogicalORExpression"]
    ],
    LogicalORExpression: [
        ["LogicalANDExpression"],
        ["LogicalORExpression", "||", "LogicalANDExpression"]
    ],
    LogicalANDExpression: [
        ["AdditiveExpression"],
        ["LogicalANDExpression", "&&", "AdditiveExpression"]
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
        ["LeftHandSideExpression"],
        ["MultiplyExpression", "*" , "LeftHandSideExpression"],
        ["MultiplyExpression", "/" , "LeftHandSideExpression"]
    ],
    LeftHandSideExpression: [
        ["CallExpression"],
        ["NewExpression"]
    ],
    CallExpression:[
        ['MemberExpression', "Arguments"],
        ['CallExpression', "Arguments"]
    ],
    Arguments: [
        ["(", ")"],
        ["(", "ArgumentList", ")"]
    ],
    ArgumentList: [
        ["AssignmentExpression"],
        ["ArgumentList", ",", "AssignmentExpression"]
    ],
    NewExpression:[
        ['MemberExpression'],
        ['new', "NewExpression"]
    ],
    MemberExpression:[
        ["PrimaryExpression"],
        ["PrimaryExpression", ".", "Identifier"],
        ["PrimaryExpression", "[", "Expression", "]"],
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
        ["RegularExpressionLiteral"],
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
            continue;
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
            continue;
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