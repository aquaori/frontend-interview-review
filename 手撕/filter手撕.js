Array.prototype.myFilter = function (callback, thisArg) {
    // 边界检查
    if (this == null) throw new TypeError("this is null or undefined");
    if (typeof callback !== "function")
        throw new TypeError("callback must be a function");

    // 转换对象（为了兼容类数组）
    const O = Object(this);

    // 使用位运算将length属性转换为无符号的32位整数，也是为了兼容类数组
    const len = O.length >>> 0;

    // 创建新数组，须设置成空数组，而不是map手撕里的new Array(len)
    // 因为filter处理后数组的长度是不确定的，所以不能预设长度
    const newArray = [];

    // 遍历并执行回调
    for (let k = 0; k < len; k++) {
        // *关键：只处理已存在的索引，即对象O中真实存在的属性，跳过稀疏数组的空槽
        if (k in O) {
            const value = O[k];
            if (callback.call(thisArg, value, k, O)) {
                newArray.push(value);
            }
        }
    }

    return newArray;
};

const origin = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const filtered = origin.myFilter((v, k) => v + k > 10);
console.log(filtered);
