/*
问题拆解：
1.Promise 一旦创建就无法取消
    - 即使我们已经判定超时了，但原Promise可能还在后台跑
    - 导致不必要的资源浪费 => 使用AbortController
2.竞态条件处理
    - 超时和正常完成可能同时发生
3.清晰的错误处理
    - 用户需要知道是超时还是其它错误
*/

function setPromiseWithTimeout(promise, ms, signal = null) {
    // 设置一个timout Promise用于控制超时
    const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Promise 超时： ${ms}ms`));
        }, ms);

        // 监听AbortController控制Promise中断
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                reject(new Error("操作取消"));
            },
            { once: true }, // 至多执行一次，执行完成后自动移除监听器
        );
    });

    // 使用Promise.race来返回第一个完成的Promise（超时中断 or 正常返回）
    return Promise.race([promise, timeoutPromise]);
}

function mockRequest(delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ code: 200, msg: "success", data: { name: "xiaoming" } });
        }, delay);
    });
}

// 测试用例 1：Promise 在超时前正常完成
const successController = new AbortController();
setPromiseWithTimeout(mockRequest(500), 1000)
    .then((res) => {
        console.log("测试1通过，正常返回:", res.data.name);
    })
    .catch((err) => {
        console.log("测试1失败:", err.message);
    });

// 测试用例 2：Promise 执行时间超过限制，触发超时
const timeoutController = new AbortController();
setPromiseWithTimeout(mockRequest(1200), 1000)
    .then((res) => {
        console.log("测试2失败，不应该进入成功分支:", res);
    })
    .catch((err) => {
        console.log("测试2结果:", err.message);
    });

// 测试用例 3：手动调用 abort，触发中断
const abortController = new AbortController();
setPromiseWithTimeout(mockRequest(1000), 3000, abortController.signal)
    .then((res) => {
        console.log("测试3失败，不应该进入成功分支:", res);
    })
    .catch((err) => {
        console.log("测试3结果:", err.message);
    });

setTimeout(() => {
    abortController.abort();
}, 200);
