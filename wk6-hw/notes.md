# 重学JavaScript（三）

## Toy-JavaScript ｜ 处理toyjs的语义 Number String

处理number类型
运行时和语法支持

## Toy-JavaScript ｜ 对象的基础知识

number和string稍微复杂一点，boolean，null，
全局的undefined不可更改，但局部undefined可更改值，不是关键字
void可以始终返回undefined的运算符，如果想用undefined可以直接复赋值void 0

- number，string，boolean，null直接是词法结构，是token
- object和array里面有语法结构需要额外处理
- regularExpression也有结构，需要转义
- symbol

object 面向对象，任何一个对象都是唯一的，也它本身的状态无关，，即使状态完全一致，也不相等
用状态描述对象，状态的改变即是行为。
在设计对象的状态和行为时，我们总是遵循“行为改变状态”的原则
（狗咬人，“咬”不应该是狗的方法，应该是“受伤”是人的方法，因为人的状态改变了）

计算机的唯一标识就是存储位置。
面向对象语言离不开identifier，state，behaviour
类是一种常见的描述对象的方式，而“归类”和“分类”是两个主要的流派
对“归类”方法而言，多继承是非常自然的事情，如c++
采用分类思想的计算机语言，则是单继承结构，并且会有一个基类object

prototype


## Toy-JavaScript ｜ js对象

## Toy-JavaScript ｜ 为toyjs添加对象类型

## Toy-JavaScript ｜ 执行上下文

## Toy-JavaScript ｜ 处理toyjs中的变量和直接量解析

## Toy-JavaScript ｜ 表达式和运算1，2，3
