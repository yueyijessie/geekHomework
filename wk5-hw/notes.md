# 重学JavaScript（二）

## Toy-JavaScript ｜ 构建语法树

把上节课形成的基础元素形成更复杂的树状的语法结构，经过精简处理会成为精简语法树AST。

对abnf进行结构化处理，形成语法树

需要实现的：
```
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
```

## Toy-JavaScript ｜ 根据语法树实现语法分析

> 接收的第一个token是什么？

需要把当前的非终结符打开，求closure

## Toy-JavaScript ｜ JavaScript执行语法树

使用evaluator逐级执行语法树

> 变量存储在哪？以什么样的方式进行存储？

> JS有一个特殊的环境environment，运行时有一个对象environmentRecord，专门用来存储这些变量

## Toy-JavaScript ｜ JavaScript运行时

7种变量类型，4种literal类型：number，string，boolean， null

其他有literal的类型：undefiend, object, symbol, array, regex

> ### 运行时类型Number

64bit = 8byte = 一个双精度浮点数的大小（JS只有一种，不像java，C#有单精度和双精度）

1个数字如何表示（64bit）
- 符号位：1bit，决定数字是正还是负，0位正，1位负
- 指数位：11bit，表示一个2的多少次方
- 具体数字的值：52bit，3就是 “1 1”

高精度要求情况下不要使用浮点数（比如金融），十进制转二进制会产生误差，比如说0.1+0.2 ！= 0.3

> ### 运行时类型String

字符集：
- ASCII
    - 最著名，最早的字符集ASCII
    - 只包含英文大小写，数字，一些特殊字符。
    - 目前不会直接使用这个字符集
- Unicode
    - 现行，事实标准。
    - JS采用，中英文欧洲各种语言都有
- UCS：中间版本，unicode2.0版本
- GB：国标，中文，与unicode不兼容
- ISO-8859: 欧洲诸国给自己国的标准
- BIG5：台湾繁体

码点： code point

编码Encoding：
- unicode使用utf编码，超过10万个字符
- utf8
    - 8是8个bit，最小用一个bit表示一个码点
    - utf8的前边存储部分与ASCII字符集相同，因此兼容好
    - 存储纯英文，空间更小

- utf16
    - 16个bit，保存
    - 存中文西文，更适合

-JS里面存的其实是用utf-16编码的