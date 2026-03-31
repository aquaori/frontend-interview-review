/*
问题拆解：
1.概念理解
    - 柯里化是什么？
    - 反柯里化又是什么？
    - 两者有什么关系？
2.手写实现
    - 怎么处理参数收集？
    - 怎么判断执行时机？
    - 边界情况怎么处理？
*/

function curry(fn) {
    const arity = fn.length;
    return function curried(...args) {
        if (args.length >= arity) {
            return fn.apply(this, args);
        }
        return function (...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
}

function uncurry(fn) {
    return function (context, ...args) {
        return fn.call(context, ...args);
    };
}

function addThree(a, b, c) {
    return a + b + c;
}

addThree(1, 2, 3);
console.log(curry(addThree)(1)(2)(3));
console.log(curry(addThree)(1, 2)(3));
console.log(curry(addThree)(1)(2, 3));

const push = uncurry(Array.prototype.push);
const obj = { length: 0 };
push(obj, 1, 2, 3);
console.log(obj);
