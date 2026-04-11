/*
这类题的三个坑：
1.稀疏数组问题
    - [1,,3]中间的空槽
    - 原生map会跳过
    - for 循环不会跳过
2.this绑定
    - map的第二个参数：thisArg
    - 回调函数的 this 指向要用call/apply
3.边界处理
    - 非数组类型处理
    - 空数组处理
    - 回调函数校验
*/

Array.prototype.myMap = function (callback, thisArg) {
    // 边界检查
    if (this == null) throw new TypeError("this is null or undefined");
    if (typeof callback !== "function")
        throw new TypeError("callback must be a function");

    // 转换对象（为了兼容类数组）
    const O = Object(this);

    // 使用位运算将length属性转换为无符号的32位整数，也是为了兼容类数组
    const len = O.length >>> 0;

    // 创建新数组
    const newArray = new Array(len);

    // 遍历并执行回调
    for (let k = 0; k < len; k++) {
        // *关键：只处理已存在的索引，即对象O中真实存在的属性，跳过稀疏数组的空槽
        if (k in O) {
            newArray[k] = callback.call(thisArg, O[k], k, O);
        }
    }

    return newArray;
};

const origin = [1, 2, 3];
const mapped = origin.myMap((k) => k * 2);
console.log(mapped);
