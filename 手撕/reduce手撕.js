Array.prototype.myReduce = function (callback, initialValue) {
    // 边界检查
    if (this == null) throw new TypeError("this is null or undefined");
    if (typeof callback !== "function")
        throw new TypeError("callback must be a function");

    // 转换对象（为了兼容类数组）
    const O = Object(this);

    // 使用位运算将length属性转换为无符号的32位整数，也是为了兼容类数组
    const len = O.length >>> 0;

    // 初始化cur指针和累加器
    let k = 0;
    let acc;

    // 判断是否传入初始值
    if (arguments.length >= 2) acc = initialValue;
    else {
        // 如果没有初始值，就找到第一个真实存在的元素作为初始值
        while (k < len && !(k in O)) k++;
        if (k >= len)
            throw new TypeError("Reduce of empty array with no initial value");

        // 将累加器初始化为第一个存在的元素的值，并将k++（关键处理！），后续直接从第二项开始遍历
        acc = O[k++];
    }

    // 遍历和累加
    for (k; k < len; k++) {
        if (k in O) acc = callback(acc, O[k], k, O);
    }

    return acc;
};

const origin = [1, 2, 3];
const reduced = origin.myReduce((acc, cur) => acc + cur, 4);
console.log(reduced);
