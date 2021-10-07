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
        ["var", "Identifier"]
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
        ["Number"]
    ]
}

let hash = {

}

// 求closure, 把start里的program展开
function closure(state) {
    hash[JSON.stringify(state)] = state; //保存state进入hash，
    let queue = [];
    for (let symbol in state) {
        queue.push(symbol);
    }
    while(queue.length){
        let symbol = queue.shift();
        console.log(symbol);
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
                current.$isRuleEnd = true; // 添加特殊符号$来表示状态
            }
        }
    }
    for (let symbol in state) {
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
    "IfStatement": end
}

closure(start);