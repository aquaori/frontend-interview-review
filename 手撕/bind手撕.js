/*
问题拆解：
1.this绑定问题
    - 普通调用绑定this
    - 参数分段传递（柯里化）
    - 保留原函数特性
2.new操作符兼容
    - new调用时this指向实例
    - 原型链要正确继承
    - 返回值处理

实现步骤：
1.将myBind方法绑定到Function的原型链上，接收一个自定义this对象和剩余参数
2.记录调用者：记录this对象，它表示了“谁调用了这个方法”
3.边界处理：使用typeof判断this对象是不是函数类型，也就是判断是不是在对一个函数调用bind
4.返回一个新函数，接收另一部分参数，并使用concat组合成全部参数，完成柯里化的过程
5.在新函数中判断是普通调用还是new调用（使用this instanceof newFunction判断）
    - 如果是new调用，就使用new返回一个新对象，传入所有参数
    - 如果是普通调用，就使用apply调用这个原函数（即上面记录的this）
8.绑定原型链：使用Object.create()创建一个新对象，传入this的原型对象，并将其赋值给新函数的原型对象
9.返回这个新函数
*/

Function.prototype.myBind = function (selfThis, ...args) {
    // 记录调用者（this），它表示了“谁调用了这个方法”
    const originFunc = this;

    // 边界处理：使用typeof判断this对象是不是函数类型，也就是判断是不是在对一个函数调用bind
    if (typeof originFunc !== "function") {
        throw new TypeError("myBind expect to be called by a function");
    }

    // 返回一个新函数，接收另一部分参数
    const newFunc = function (...innerArgs) {
        // 使用concat组合成全部参数，完成柯里化的过程
        const totalArgs = args.concat(innerArgs);

        // 判断是普通调用还是new调用（使用this instanceof newFunction判断）
        if (this instanceof newFunc) {
            // 如果是new调用，就使用new返回一个新对象，传入所有参数
            return new originFunc(...totalArgs);
        } else {
            // 如果是普通调用，就使用apply调用这个原函数（即上面记录的this）
            return originFunc.apply(selfThis, totalArgs);
        }
    };

    // 绑定原型链：使用Object.create()创建一个新对象，传入this的原型对象，并将其赋值给新函数的原型对象
    newFunc.prototype = Object.create(originFunc.prototype);

    // 返回新函数
    return newFunc;
};

function Person(name) {
    this.name = name;
}

const boundPerson = Person.myBind({ name: "Ignored" });

const personInstance = new boundPerson("Bob");

console.log(boundPerson("Bob"));
console.log(personInstance.name);
