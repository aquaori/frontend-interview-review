/*
数组去重问题拆解（需求）：
1.基本类型
    - 数字、字符串去重
    - NaN的特殊处理
    - 保持原数组顺序
2.对象/数组
    - 引用类型比较
    - 指定字段去重
    - 深度对比问题
3.性能考量
    - 时间复杂度O(N)
    - 空间复杂度权衡
    - 大数据量优化
*/

// 第一种：数组转Set转数组去重
// 优点：能考虑到所有基本类型，包括NaN
function uniqueBySet(arr) {
    return [...new Set(arr)];
}

// 第二种：双重循环（传统方法）
// 缺点：时间复杂度O(N^2)
function uniqueByLoop(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) result.push(arr[i]);
    }
    return result;
}

// 第三种：对象键值去重（双重循环优化版，利用对象键值的唯一性）
// 优点：时间复杂度O(N^2)
// 缺点：有类型转换问题，对象的键的类型会被强制转换成字符串
function uniqueByObject(arr) {
    const obj = {};
    const result = [];
    for (let item of arr) {
        if (!obj[item]) {
            obj[item] = true;
            result.push(item);
        }
    }
    return result;
}

// 第四种：对象数组去重（对象键值去重优化版，利用Map的键值可以是任意类型的性质）
function uniqueByKey(arr, key) {
    const map = new Map();
    return arr.filter((item) => {
        if (!map.has(item[key])) {
            map.set(item[key], true);
            return true;
        }
        return false;
    });
}

// 第五种：JSON 序列化去重（适用于对整个对象进行去重，而不是针对某个字段去重）
// 缺点：对象属性顺序会影响JSON的判断结果，不是很通用
function uniqueByJSON(arr) {
    const seen = new Set();
    return arr.filter((item) => {
        const key = JSON.stringify(item);
        if (!seen.has(key)) {
            seen.add(key);
            return true;
        }
        return false;
    });
}

// 第六种：filter + indexOf
// 优点：代码简洁直观
// 缺点：严格相等无法判断NaN，因为NaN不等于自身
function uniqueByFilter(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 第七种：filter + includes (ES7)
// 优点：可以判断NaN
function uniqueByIncludes(arr) {
    const result = [];
    arr.forEach((item) => {
        if (!result.includes(item)) result.push(item);
    });
    return result;
}

// 最终完整版，支持对象数组+指定字段+自定义比较函数
function unique(arr, options = {}) {
    const { keys, compareFn } = options;
    if (!keys && !compareFn) {
        // 说明是纯基本类型数组，或是没有指定过滤字段
        return [...new Set(arr)];
    }
    // 否则是对象类型数组，且指定了过滤字段
    if (keys) {
        const map = new Map();
        return arr.filter((item) => {
            const key = keys.map((k) => item[k]).join(" | ");
            if (!map.has(key)) {
                map.set(key, true);
                return true;
            }
            return false;
        });
    }
    if (compareFn) {
        return arr.filter(
            (item, index, self) =>
                index === self.findIndex((t) => compareFn(t, item)),
        );
    }
}

// 不指定字段
console.log(unique([1, 1, 2, 3, 4, 5, 5, 5, 6, NaN, NaN]));

// 指定字段
console.log(
    unique(
        [
            { id: 1, name: "张三" },
            { id: 2, name: "张三" },
            { id: 2, name: "李四" },
            { id: 2, name: "王五" },
        ],
        {
            keys: ["id", "name"],
        },
    ),
);
