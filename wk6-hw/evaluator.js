import {ExecutionContext, Reference, Realm} from "./runtime.js";

class Evaluator {
    constructor(){
        this.realm = new Realm();
        this.globalObject = {};
        this.ecs = [new ExecutionContext(this.realm, this.globalObject)];
    }
    // 执行语法树
    evaluate(node) {
        if (this[node.type]){
            return this[node.type](node);
        }
    }
    Program(node){
        // console.log(node)
        return this.evaluate(node.children[0]);
    }
    StatementList(node) {
        // console.log(node)
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        } else {
            this.evaluate(node.children[0]);
            return this.evaluate(node.children[1]);
        }
    }
    Statement(node) {
        return this.evaluate(node.children[0]);
    }
    VariableDeclaration(node){
        // console.log("Declare varible", node.children[1].name);
        let runningEC = this.ecs[this.ecs.length - 1];
        runningEC.variableEnvironment[node.children[1].name];
    }
    ExpressionStatement(node){
        return this.evaluate(node.children[0]);
    }
    Expression(node){
        return this.evaluate(node.children[0]);
    }
    AdditiveExpression(node){
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        else {
            // todo
        }
    }
    MultiplyExpression(node){
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        else {
            // todo
        }
    }
    PrimaryExpression(node){
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
    }
    Literal(node){
        return this.evaluate(node.children[0]);
    }
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
        // console.log(value)
        return Number(node.value);
        // return evaluate(node.children[0]);
    }
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
        // console.log(result);
        return result.join('');
    }
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
    }
    PropertyList(node, object){
        if(node.children.length === 1){
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    }
    Property(node, object){
        let name;
        if(node.children[0].type === 'Identifier'){
            name = node.children[0].name;
        }else if(node.children[0].type === 'StringLiteral'){
            name = this.evaluate(node.children[0]);
        }
        object.set(name, {
            value: this.evaluate(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true
        })
    }
    AssignmentExpression(node){
        if(node.children.length === 1){
            return this.evaluate(node.children[0]);
        }
        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        left.set(right);
    }
    Identifier(node){
        console.log(node)
        let runningEC = this.ecs[this.ecs.length - 1];
        return new Reference(
            runningEC.lexicalEnvironment,
            node.value
        );
    }
}