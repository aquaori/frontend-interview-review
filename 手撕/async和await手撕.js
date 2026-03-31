/*
问题拆解：
1.为什么要使用generator实现async和await？
    - 都有暂停执行能力：generator使用yield暂停，async使用await暂停
    - 恢复执行能力：await能在Promise resolve后继续
    - 双向通信：能传值进函数，也能传错误
2.为什么需要执行器？（generator有什么不足的地方？）
    - generator需要.next()手动驱动
    - 执行器可以自动管理Promise链
    - 执行器能处理错误传递和最终返回值
3.核心问题：
    - generator需要手动执行.next()
    - Promise的reject要怎么传给generator？
    - async应该返回Promise，但generator返回的是一个迭代器

用 generator + 自动迭代器模拟 async / await，通常分成两层：
1. run: 负责自动执行 generator，处理 next / throw / Promise 衔接。
2. myAsync: 负责把 generator 函数包装成“像 async 一样可直接调用”的普通函数。

对应关系：
- await x        <=> yield x
- async function <=> myAsync(generatorFn)
*/

function run(genFn, ...args) {
    return new Promise((resolve, reject) => {
        const it = genFn(...args);

        function step(method, value) {
            let result;

            try {
                result = it[method](value);
            } catch (error) {
                reject(error);
                return;
            }

            const { value: yieldedValue, done } = result;

            if (done) {
                resolve(yieldedValue);
                return;
            }

            Promise.resolve(yieldedValue).then(
                (val) => step("next", val),
                (err) => step("throw", err),
            );
        }

        step("next");
    });
}

function myAsync(genFn) {
    return function (...args) {
        return run(genFn, ...args);
    };
}

const request = (data, delay = 300) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });

const readUser = myAsync(function* (id) {
    const user = yield request({ id, name: "Tom" });
    const score = yield request(95);

    return {
        ...user,
        score,
    };
});

readUser(1)
    .then((res) => {
        console.log("success:", res);
    })
    .catch((err) => {
        console.log("error:", err);
    });
