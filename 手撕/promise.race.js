/*
Promise.race: 返回第一个完成的，无论成功与失败
边界处理：如果传入的promises是一个空数组，不会立即resolve，而是会一直处于pending状态
*/

Promise.myRace = function (promises) {
    return new Promise((resolve, reject) => {
        // 遍历promises数组并执行
        promises.forEach((promise) => {
            // 执行并返回第一个promise的resolve或reject
            Promise.resolve(promise).then(resolve, reject);
        });
    });
};

// 测试1：谁先成功就返回谁
const p1 = new Promise((resolve) => {
    setTimeout(() => resolve("p1"), 1000);
});

const p2 = new Promise((resolve) => {
    setTimeout(() => resolve("p2"), 500);
});

Promise.myRace([p1, p2]).then((res) => {
    console.log("测试1:", res); // 预期：测试1: p2
});

// 测试2：谁先失败就走 reject
const p3 = new Promise((_, reject) => {
    setTimeout(() => reject("p3 fail"), 300);
});

const p4 = new Promise((resolve) => {
    setTimeout(() => resolve("p4"), 1000);
});

Promise.myRace([p3, p4])
    .then((res) => {
        console.log("测试2:", res);
    })
    .catch((err) => {
        console.log("测试2:", err); // 预期：测试2: p3 fail
    });

// 测试3：普通值也能参与 race
Promise.myRace([100, p1]).then((res) => {
    console.log("测试3:", res); // 预期：测试3: 100
});
