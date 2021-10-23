class XRegExp {
    constructor(source, flag, root = "root") {
        this.table = new Map(); // 记录InputElement，whitespace等对应的都是什么
        this.regexp = new RegExp(this.compileRegExp(source, root, 0).source, flag);
    }

    // 生成一个长的正则表达式
    compileRegExp(source, name, start) {
        if (source[name] instanceof RegExp) {
            return {
                source: source[name].source,
                length: 0
            };
        }
        // length是节点数
        let length = 0;
        let regexp = source[name].replace(/\<([^>]+)\>/g, (str, $1) => {
            this.table.set(start + length, $1);
            //this.table.set($1, start + length);
            ++length;
            let r = this.compileRegExp(source, $1, start + length);
            length += r.length;
            return "(" + r.source + ")";
        });
        return {
            source: regexp,
            length: length
        };
    }

    // string是输入的source code，
    exec(string){
        let r = this.regexp.exec(string);
        for (let i = 1; i < r.length; i++) {
            if(r[i] !== void 0){ // 如果不是undeifned
                // console.log(this.table.get(i - 1));
                r[this.table.get(i - 1)] = r[i];
            }
        }
        // console.log(JSON.stringify(r[0]));
        return r;
    }
    get lastIndex(){
        return this.regexp.lastIndex;
    }
    set lastIndex(value){
        return this.regexp.lastIndex = value;
    }
}

// 添加*，函数生成器：调用函数生成以恶搞控制器，调用next方法执行函数，遇到yield暂停
export function* scan(str){
    // 产生式的表达方式
    let regexp = new XRegExp({
        InputElement: "<WhiteSpace>|<LineTerminator>|<Comments>|<Token>",
        WhiteSpace: / /,
        LineTerminator: /\n/,
        Comments: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
        Token: "<Literal>|<Keywords>|<Identifier>|<Punctuator>", // keyword要写在identifier前，因为keyword满足identifier的一切属性
        Literal: "<NumericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
        NumericLiteral: /0x[0-9a-zA-Z]+|0o[0-7]+|0b[01]+|(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/, // 二进制+十进制整数+小数
        BooleanLiteral: /true|false/,
        StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,  //实际字符串要更复杂，还有多种换行符，转义符等
        NullLiteral: /null/,
        Identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
        Keywords: /if|else|for|function|let|var/,
        Punctuator: /\+|\,|\?|\:|\{|\}|\.|\(|\=|\<|\+\+|\=\=|\=\>|\*|\)|\[|\]|;/
    }, "g", "InputElement")

    while(regexp.lastIndex < str.length) {
        let r = regexp.exec(str); // 返回匹配到的字符，或者null
        
        if (r.WhiteSpace) {

        } else if(r.LineTerminator) {

        } else if (r.Comments) {

        } else if (r.NumericLiteral) {
            yield {
                type: "NumericLiteral",
                value: r[0]
            }
        } else if (r.BooleanLiteral) {
            yield {
                type: "BooleanLiteral",
                value: r[0]
            }
        } else if (r.StringLiteral) {
            yield {
                type: "StringLiteral",
                value: r[0]
            }
        } else if (r.NullLiteral) {
            yield {
                type: "NullLiteral",
                value: null
            }
        } else if (r.Identifier) {
            yield {
                type: "Identifier",
                value: r[0]
            }
        } else if (r.Keywords) {
            yield {
                type: r[0]
            }
        } else if (r.Punctuator) {
            yield {
                type: r[0]
            }
        } else {
            throw new Error("unexpected token " + r[0]);
        }
        // document.write(r[0])
        if (!r[0].length){
            break;
        }
    }
    yield {
        type: "EOF"
    }
}

// let source = (`
// for(let i = 0; i < 3; i++){
//     for (let j = 0; j < 3; j++) {
//         let cell = document.createElement("div");
//         cell.classList.add("cell");
//         cell.innerText = pattern[i*3+j] == 2 ? "❌" :
//             pattern[i * 3 + j] == 1 ? "⭕️" : "";
//         cell.addEventListener("click", () => userMove(j,i));
//         board.appendChild(cell);
//     }
//     board.appendChild(document.createElement("br"));
// }
// `)

// for (let elememt of scan(source)) {
//     console.log(elememt)
// }