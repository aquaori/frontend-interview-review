/*
问题拆解：
1.并发控制
    - 多个Promise同时执行，但结果要按原始顺序返回
2.完成时机
    - 必须等所有Promise都完成才能resolve最终结果
3.异常捕获
    - 如果有某个promise reject了，不中止myAll的运行，而是记录到results中一起返回
*/
Promise.myAllSettled = function (promises) {
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
            Promise.resolve(promise)
                .then(
                    (value) => {
                        // 使用index将结果按序加入返回数组
                        results[index] = { status: "fulfilled", value: value };
                    },
                    (reason) => {
                        // 如果有某个promise reject了，不中止myAll的运行，而是记录到results中一起返回
                        results[index] = { status: "rejected", reason: reason };
                    },
                )
                .finally(() => {
                    // 递增完成数量
                    count++;

                    // 当完成数量等于总promises数量时，结束等待
                    if (count === promises.length) {
                        resolve(results);
                    }
                });
        });
    });
};

const p1 = Promise.resolve("A");

const p2 = Promise.reject("B error");

const p3 = new Promise((resolve) => {
    setTimeout(() => resolve("C"), 1000);
});

const p4 = new Promise((_, reject) => {
    setTimeout(() => reject("D error"), 500);
});

const p5 = 123;

Promise.myAllSettled([p1, p2, p3, p4, p5]).then((res) => {
    console.log("myAllSettled结果:", res);
});
