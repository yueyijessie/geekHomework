import {Evaluator} from "./evaluator.js";
import {parse} from "./SyntaxParser.js";

// 绑定事件和监听
document.getElementById("run").addEventListener("click", event => {
    let r = new Evaluator().evaluate(parse(document.getElementById("source").value));
    console.log(r);
})
