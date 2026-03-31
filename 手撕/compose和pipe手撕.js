/*
核心区别：
1.执行顺序
    - compose从右到左执行
    - pipe从左到右执行
    - 数据流向清晰
2.实现：
    - reduce / reduceRight
    - 函数柯里化
    - 返回一个新函数
3.应用场景：
    - 数据处理管道
    - 中间件组合（如Redux和Koa）
    - 提高代码可读性和可维护性
*/

function compose(...fns) {
    return function (value) {
        // 使用reduceRight方法从右至左的遍历、执行和累加函数
        return fns.reduceRight((acc, fn) => fn(acc), value);
    };
}

function pipe(...fns) {
    return function (value) {
        // 使用reduce方法从左到右的遍历、执行和累加函数
        return fns.reduce((acc, fn) => fn(acc), value);
    };
}

// 定义几个基础工具函数（带执行日志，方便观察顺序）
const add = (x) => {
    console.log("→ 执行 add: x + 1");
    return x + 1;
};
const multiply = (x) => {
    console.log("→ 执行 multiply: x * 2");
    return x * 2;
};
const subtract = (x) => {
    console.log("→ 执行 subtract: x - 3");
    return x - 3;
};

const toUpperCase = (str) => {
    console.log("→ 执行 toUpperCase");
    return str.toUpperCase();
};
const addHello = (str) => {
    console.log("→ 执行 addHello");
    return `Hello ${str}`;
};
const reverse = (str) => {
    console.log("→ 执行 reverse");
    return str.split("").reverse().join("");
};

// ------------------------------
// 1. 基础数字运算测试（体现执行顺序）
// ------------------------------
console.log("=== 测试 compose（从右往左执行） ===");
const composed = compose(subtract, multiply, add);
console.log("输入: 5");
const composeRes = composed(5);
console.log("compose 结果:", composeRes); // 预期：9

console.log("\n=== 测试 pipe（从左往右执行） ===");
const piped = pipe(add, multiply, subtract);
console.log("输入: 5");
const pipeRes = piped(5);
console.log("pipe 结果:", pipeRes); // 预期：9

// ------------------------------
// 2. 反向等价性测试（compose 和 pipe 顺序相反）
// ------------------------------
console.log("\n=== 测试 compose/pipe 反向等价 ===");
const composedReverse = compose(add, multiply, subtract);
const pipedReverse = pipe(subtract, multiply, add);
console.log("compose(add, multiply, subtract)(5):", composedReverse(5)); // 预期：5
console.log("pipe(subtract, multiply, add)(5):", pipedReverse(5)); // 预期：5

// ------------------------------
// 3. 字符串处理测试
// ------------------------------
console.log("\n=== 测试字符串 compose ===");
const strCompose = compose(reverse, addHello, toUpperCase);
console.log("输入: 'world'");
console.log("结果:", strCompose("world")); // 预期："DLROW olleH"

console.log("\n=== 测试字符串 pipe ===");
const strPipe = pipe(toUpperCase, addHello, reverse);
console.log("输入: 'world'");
console.log("结果:", strPipe("world")); // 预期："DLROW olleH"

// ------------------------------
// 4. 边界场景：空函数列表（直接返回原值）
// ------------------------------
console.log("\n=== 测试空函数列表 ===");
const emptyCompose = compose();
console.log("compose()(10):", emptyCompose(10)); // 预期：10

const emptyPipe = pipe();
console.log("pipe()(10):", emptyPipe(10)); // 预期：10
