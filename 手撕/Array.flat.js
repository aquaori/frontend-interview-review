Array.prototype.myFlat = function (depth = 1) {
    // 边界处理
    if (!Array.isArray(this) || depth < 0) return this;

    // 使用reduce累加器实现扁平化
    return this.reduce((acc, cur) => {
        // 如果当前元素是数组，并且还有深度可以展开
        // 则递归调用myFlat，并使用concat将结果与累加器合并
        if (Array.isArray(cur) && depth > 0) {
            return acc.concat(cur.myFlat(cur, depth - 1));
        } else {
            // 如果当前元素不是数组，或者已经没有深度了，则直接concat添加到累加器
            // 关键：用concat([cur])将cur作为单个元素添加，避免数组被展开
            return acc.concat([cur]);
        }
    }, []); // 初始值是一个空数组，即最终扁平化的数组
};

console.log([1, [2, 3], [4, [5, 6]]].myFlat());
