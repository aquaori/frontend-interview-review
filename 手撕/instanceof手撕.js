/*
问题拆解：
1.原型链遍历
    - 要沿着__proto__一直找
    - 直到找到null为止
    - 循环的终止条件
2.边界处理
    - 左边是基本类型怎么办？
    - 左边是null怎么办？
    - 右边不是函数怎么办？
*/

function myInstanceof(left, right) {
    // 边界处理
    if (typeof left !== "object" || left === null) {
        return false;
    }
    if (typeof right !== "function") {
        throw new TypeError("Right-hand side is not callable");
    }
    while (left) {
        if (Object.getPrototypeOf(left) !== right.prototype)
            left = Object.getPrototypeOf(left);
        else return true;
    }
    return false;
}

console.log(myInstanceof(new Date(), Object)); // true
console.log(myInstanceof({}, Object)); // true
console.log(myInstanceof([], Array)); // true
console.log(myInstanceof(123, Number)); // false
console.log(myInstanceof(null, Object)); // false
console.log(myInstanceof({}, Array)); // false
