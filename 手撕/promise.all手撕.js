/*
问题拆解：
1.并发控制
    - 多个Promise同时执行，但结果要按原始顺序返回
2.完成时机
    - 必须等所有Promise都完成才能resolve最终结果
3.异常捕获
    - 有任何一个promise reject了，整个promise.all都直接reject
*/
Promise.myAll = function (promises) {
    return new Promise((resolve, reject) => {
        // 边界处理：如果传进来的promises没有任何promise，就立即resolve返回
        if (promises.length === 0) {
            return resolve([]);
        }

        // 定义返回数组和完成数量
        const results = [];
        let count = 0;

        // 遍历promises，挨个执行并捕获结果
        promises.forEach((promise, index) => {
            // 使用Promise.resolve包裹兼容基本类型
            Promise.resolve(promise).then(
                (value) => {
                    // 使用index将结果按序加入返回数组
                    results[index] = value;

                    // 递增完成数量
                    count++;

                    // 当完成数量等于总promises数量时，结束等待
                    if (count === promises.length) {
                        resolve(results);
                    }
                },
                (reason) => {
                    // 如果有任何一个promise reject了，整个myAll Promise都将reject
                    reject(reason);
                },
            );
        });
    });
};

// ========== 1. 全是 Promise，全部成功 ==========
const p1 = new Promise((resolve) => {
    setTimeout(() => resolve("A"), 1000);
});

const p2 = new Promise((resolve) => {
    setTimeout(() => resolve("B"), 500);
});

const p3 = new Promise((resolve) => {
    setTimeout(() => resolve("C"), 1500);
});

Promise.myAll([p1, p2, p3])
    .then((res) => {
        console.log("测试1成功:", res);
        // 预期: ["A", "B", "C"]
    })
    .catch((err) => {
        console.log("测试1失败:", err);
    });

// ========== 2. 混合普通值和 Promise ==========
const p4 = Promise.resolve(100);
const p5 = 200;
const p6 = new Promise((resolve) => {
    setTimeout(() => resolve(300), 800);
});

Promise.myAll([p4, p5, p6])
    .then((res) => {
        console.log("测试2成功:", res);
        // 预期: [100, 200, 300]
    })
    .catch((err) => {
        console.log("测试2失败:", err);
    });

// ========== 3. 有一个失败，应该立刻 reject ==========
const p7 = new Promise((resolve) => {
    setTimeout(() => resolve("ok1"), 1000);
});

const p8 = new Promise((_, reject) => {
    setTimeout(() => reject("error from p8"), 600);
});

const p9 = new Promise((resolve) => {
    setTimeout(() => resolve("ok3"), 1500);
});

Promise.myAll([p7, p8, p9])
    .then((res) => {
        console.log("测试3成功:", res);
    })
    .catch((err) => {
        console.log("测试3失败:", err);
        // 预期: "error from p8"
    });
