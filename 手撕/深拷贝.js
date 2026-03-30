/*
思路：
1.接收一个克隆对象target和一个WeakMap（WeakMap用来临时存储循环引用的对象）
2.判断是否为基本类型和null，如果是则直接返回
3.判断是否为循环引用，即WeakMap中是否有target，如果有则直接返回
4.判断是否为特殊对象类型（Date / 正则 / Map / Set）
    - Date：使用构造函数返回新对象
    - 正则（RegExp）：使用构造函数返回新对象
    - Map：构造新Map（cloneMap），插入到WeakMap中，递归遍历Map的每一项元素进行深拷贝
    - Set：构造新Set（cloneSet），插入到WeakMap中，递归遍历Set的每一项元素进行深拷贝
5.如果都不是，则判断target是对象还是数组，并按类型创建克隆对象cloneTarget为空数组（[]）或空对象（{}）
6.将cloneTarget插入到WeakMap中，键为target，值为cloneTarget
7.遍历target的每一项元素，递归调用自身函数，完成深拷贝
8.返回cloneTarget
*/
function deepClone(target, map = new WeakMap()) {
    // 处理基本类型
    if (target === null || typeof target !== "object") {
        return target;
    }

    // 处理循环引用
    if (map.has(target)) return map.get(target);

    // 处理特殊对象类型（Date & 正则 & Map & Set）
    if (target instanceof Date) return new Date(target);
    if (target instanceof RegExp) return new RegExp(target);
    if (target instanceof Map) {
        const cloneMap = new Map();
        map.set(target, cloneMap);
        target.forEach((v, k) => cloneMap.set(k, deepClone(v, map)));
        return cloneMap;
    }
    if (target instanceof Set) {
        const cloneSet = new Set();
        map.set(target, cloneSet);
        target.forEach((v) => cloneSet.add(deepClone(v, map)));
        return cloneSet;
    }

    // 克隆内容
    const cloneTarget = Array.isArray(target) ? [] : {};
    map.set(target, cloneTarget);
    const allKeys = Object.keys(target).concat(
        Object.getOwnPropertySymbols(target),
    );
    for (let key of allKeys) {
        cloneTarget[key] = deepClone(target[key], map);
    }
    return cloneTarget;
}

const origin = [
    1,
    2,
    3,
    {
        x: 4,
        y: 5,
        z: [
            6,
            7,
            8,
            {
                p: 9,
                q: 0,
                a: new Set([10, 11, 12]),
                b: new Map([
                    ["c", 13],
                    ["d", 14],
                    ["e", 15],
                ]),
            },
        ],
    },
];
console.dir(deepClone(origin), { depth: null });
