function memoize(fn) {
    const caches = new Map();
    return function (...args) {
        // 使用JSON序列化作为键，但是部分特殊对象无法处理，有适用范围
        const argList = JSON.stringify(args);
        if (caches.has(argList)) {
            console.log("缓存命中");
            return caches.get(argList);
        } else {
            console.log("缓存未命中");
            const result = fn.apply(this, args);
            caches.set(argList, result);
            return result;
        }
    };
}

function plus(a, b) {
    return a + b;
}

const memoized = memoize(plus);

console.log(memoized(1, 2));
console.log(memoized(1, 2));
console.log(memoized(3, 6));
