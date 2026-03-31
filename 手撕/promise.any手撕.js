/*
Promise.any: 返回第一个成功的结果，忽略所有失败，全部失败则抛出AggregateError
边界处理：如果传入的promises是一个空数组，立即reject并报错
*/

Promise.myAny = function (promises) {
    return new Promise((resolve, reject) => {
        // 边界处理：如果传进来的promises没有任何promise，就立即resolve返回
        if (promises.length === 0) {
            return reject(new AggregateError([], "All promises were rejected"));
        }

        // 定义完成数量和错误信息数组
        let count = 0;
        const errors = [];

        // 遍历promises数组并执行
        promises.forEach((promise, index) => {
            Promise.resolve(promise).then(
                // 如果成功则直接resolve
                (value) => {
                    return resolve(value);
                },
                (reason) => {
                    // 如果中途出现了失败的，则先记录reason并忽略它
                    errors[index] = reason;
                    count++;

                    // 如果全部都失败了，则抛出一个AggregateError
                    if (count === promises.length) {
                        reject(
                            new AggregateError(
                                errors,
                                "All promises were rejected",
                            ),
                        );
                    }
                },
            );
        });
    });
};

// 测试1：有一个先成功
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => reject("p1 fail"), 1000);
});

const p2 = new Promise((resolve) => {
    setTimeout(() => resolve("p2 success"), 500);
});

const p3 = new Promise((resolve, reject) => {
    setTimeout(() => reject("p3 fail"), 300);
});

Promise.myAny([p1, p2, p3])
    .then((res) => {
        console.log("测试1成功:", res); // 预期：p2 success
    })
    .catch((err) => {
        console.log("测试1失败:", err);
    });

// 测试2：全部失败
const p4 = new Promise((resolve, reject) => {
    setTimeout(() => reject("p4 fail"), 200);
});

const p5 = new Promise((resolve, reject) => {
    setTimeout(() => reject("p5 fail"), 400);
});

Promise.myAny([p4, p5])
    .then((res) => {
        console.log("测试2成功:", res);
    })
    .catch((err) => {
        console.log("测试2失败:", err);
        console.log("测试2 errors:", err.errors); // 预期：["p4 fail", "p5 fail"]
    });

// 测试3：普通值直接成功
Promise.myAny([100, Promise.reject("xxx")])
    .then((res) => {
        console.log("测试3成功:", res); // 预期：100
    })
    .catch((err) => {
        console.log("测试3失败:", err);
    });

// 测试4：空数组
Promise.myAny([])
    .then((res) => {
        console.log("测试4成功:", res);
    })
    .catch((err) => {
        console.log("测试4失败:", err);
        console.log("测试4 errors:", err.errors); // 预期：[]
    });
