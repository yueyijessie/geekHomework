# 重学JavaScript（二）

## Toy-JavaScript ｜ 构建语法树

把上节课形成的基础元素形成更复杂的树状的语法结构，经过精简处理会成为精简语法树AST。
对abnf进行结构化处理，形成语法树

需要实现的：
var a = 1;

a() + 10 * x;

if (a) {

} else {

}

while(1){

}

function foo(x, y){
    return abc;
}

## Toy-JavaScript ｜ 根据语法树实现语法分析（一）

接收的第一个token是什么？
    需要把当前的非终结符打开，求closure

