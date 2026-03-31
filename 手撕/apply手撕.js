/*
问题拆解：
1.上下文切换
    - this指向要准确
    - 原始值要转成对象
    - null / undefined要指向全局对象
2.参数处理
    - apply接收的是参数数组
    - 两个函数都需要将参数正确传递
3.属性安全
    - 如何在对象上临时“挂载”一个方法？
    - 这个临时属性名如何确保不与原始属性冲突？
    - 执行完后如何“清理战场”，不污染原对象？

核心逻辑：
1.参数解构：第一个参数是context（也就是this对象），第二个参数是args，是个数组
2.边界处理：context如果是null或undefined，就把它指向全局对象globalThis，如果args没传，则初始化为空数组，如果args不是数组或者没传，则要丢出一个TypeError
3.原始值包装：用Object()将context包装成对象，这样即便是数组、字符串也能挂载方法，在调用最终函数时，使用扩展运算符...args将数组展开成参数列表

关键细节优化：
1.Symbol唯一性：使用Symbol()创建一个独一无二的属性键，从根本上避免属性名冲突
2.使用try...finally结构：确保无论函数执行是否报错，临时属性都能被删除
3.delete清理：在finally中，使用delete操作符移除挂载在context上的临时方法，防止内存泄露
*/

Function.prototype.myApply = function (context, args = []) {
    // context如果是null或undefined，就把它指向全局对象globalThis
    context = Object(context ?? globalThis);

    // 使用Symbol()创建一个独一无二的属性键，从根本上避免属性名冲突
    const key = Symbol("fn");

    // 将函数挂载到context上
    context[key] = this;

    // 重点：如果args不是数组，则丢出一个TypeError
    if (!Array.isArray(args)) {
        throw new TypeError("CreateListFromArrayLike called on non-object");
    }

    //初始化返回值
    let result;

    // 使用try...catch...finally语句执行函数、捕获错误和清理临时函数
    try {
        // 执行函数并接收返回值
        result = context[key](...args);
    } catch (error) {
        console.error(`函数调用出错：${error}`);
    } finally {
        // 删除绑定在对象上的函数，防止内存泄露
        delete context[key];
    }

    // 返回函数返回值
    return result;
};

function Person(name) {
    this.name = name;
}

function greeting(words) {
    console.log(`${words}, ${this.name}!`);
}

const xiaoMing = new Person("xiaoming");
greeting.myApply(xiaoMing, ["Good morning"]);
