/*
问题拆解：
1.上下文切换
    - this指向要准确
    - 原始值要转成对象
    - null / undefined要指向全局对象
2.参数处理
    - call接收的是参数列表
    - 两个函数都需要将参数正确传递
3.属性安全
    - 如何在对象上临时“挂载”一个方法？
    - 这个临时属性名如何确保不与原始属性冲突？
    - 执行完后如何“清理战场”，不污染原对象？

核心逻辑：
1.参数解构：第一个参数是context（也就是this对象），后面用剩余参数...args接收
2.边界处理：context如果是null或undefined，就把它指向全局对象globalThis
3.原始值包装：用Object()将context包装成对象，这样即便是数组、字符串也能挂载方法，原本就是对象类型的context也不会被重复包裹

关键细节优化：
1.Symbol唯一性：使用Symbol()创建一个独一无二的属性键，从根本上避免属性名冲突
2.使用try...finally结构：确保无论函数执行是否报错，临时属性都能被删除
3.delete清理：在finally中，使用delete操作符移除挂载在context上的临时方法，防止内存泄露
*/

Function.prototype.myCall = function (context, ...args) {
    context = Object(context ?? globalThis);
    const key = Symbol("fn");
    context[key] = this;
    let result;
    try {
        result = context[key](...args);
    } catch (error) {
        console.error(`函数调用出错：${error}`);
    } finally {
        delete context[key];
    }
    return result;
};

function Person(name) {
    this.name = name;
}

function greeting(words) {
    console.log(`${words}, ${this.name}!`);
}

const xiaoMing = new Person("xiaoming");
greeting.myCall(xiaoMing, "Good Morning");
