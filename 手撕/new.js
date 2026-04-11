/*
问题拆解：
1.创建对象
    - 原型链怎么连？
    - __proto__指向谁？
    - 继承怎么实现？
2.this绑定
    - 构造函数的this
    - 执行上下文
    - 参数传递
3.返回值处理
    - 对象类型返回什么？
    - 基本类型返回什么？
*/

function myNew(Constructor, ...args) {
    // 创建一个新对象，并绑定原型链
    const obj = Object.create(Constructor.prototype);

    // 执行构造函数，指定this对象，并获取返回值
    const result = Constructor.apply(obj, args);

    // 如果返回值是一个对象，就返回这个对象，如果是基本类型，就返回刚才新建的对象
    return result instanceof Object ? result : obj;
}

console.log(myNew(Date) instanceof Date);
