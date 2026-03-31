/*
问题拆解：
1.规范复杂
    - A+ Promise规范内容非常多
    - 要处理各种边界情况
2.状态管理
    - pending、fulfilled、rejected三态
    - 状态只能单向转换，不可逆
3.异步处理
    - then必须异步执行
    - 要用微任务（使用queueMicrotask加入微任务队列）
4.链式调用
    - 每个then要返回新的Promise对象
    - 要处理好值穿透
*/

// 处理.then方法状态，x为.then的返回值
function resolvePromise(newPromise, x, resolve, reject) {
    // 情况1：如果then内部循环引用了自身，则直接reject，避免无限递归
    if (newPromise === x)
        return reject(new TypeError("Chaining cycle detected for promise"));
    // 情况2：如果then返回的是一个新的MyPromise对象，则尝试递归执行这个新的MyPromise对象的.then函数
    if (x instanceof MyPromise) {
        x.then((y) => {
            resolvePromise(newPromise, y, resolve, reject);
        }, reject);
    } else if (
        x !== null &&
        (typeof x === "object" || typeof x === "function")
    ) {
        // 如果then的返回值是一个类Promise对象，则尝试执行这个类Promise对象的.then函数
        // 只允许改变一次状态，避免不规范的then函数多次resolve和reject
        let called = false;
        try {
            // 尝试获取类Promise对象的.then函数
            const then = x.then;

            // 如果有.then函数则执行
            if (typeof then === "function") {
                then.call(
                    x, // 考虑到.then函数内部可能需要用到this，在调用时要指定this为这个类Promise对象本身
                    (y) => {
                        if (called) return; // 如果不是首次调用，则阻止resolve并返回
                        called = true; // 改变调用状态
                        resolvePromise(newPromise, y, resolve, reject); // 处理.then返回值
                    },
                    (r) => {
                        if (called) return; // 如果不是首次调用，则阻止resolve并返回
                        called = true; // 改变调用状态
                        reject(r);
                    },
                );
            } else {
                resolve(x); // 如果返回值只是一个普通的对象类型，则直接resolve并返回
            }
        } catch (error) {
            reject(error); // 考虑到.then方法也可能出错，要进行捕获
        }
    } else {
        resolve(x); // 如果返回值只是一个普通的基础类型，则直接resolve并返回
    }
}

class MyPromise {
    constructor(executor) {
        this.state = "pending"; // 初始状态
        this.value = undefined; // 成功值
        this.reason = undefined; // 失败原因
        this.onFulfilledCallbacks = []; // 成功回调队列
        this.onRejectedCallbacks = []; // 失败回调队列

        // resolve 方法
        const resolve = (value) => {
            // 判断只有pending方法才能从pending状态变为fulfilled状态
            if (this.state === "pending") {
                this.state = "fulfilled"; // 改变MyPromise状态
                this.value = value; // 更新成功值
                this.onFulfilledCallbacks.forEach((fn) => fn()); // 逐一调用未resolve时堆积的.then回调
            }
        };

        // reject 方法
        const reject = (reason) => {
            // 判断只有pending方法才能从pending状态变为rejected状态
            if (this.state === "pending") {
                this.state = "rejected"; // 改变MyPromise状态
                this.reason = reason; // 更新失败原因
                this.onRejectedCallbacks.forEach((fn) => fn()); // 逐一调用未reject时堆积的.then回调
            }
        };

        // executor是立即执行的
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    // then 方法
    then(onFulfilled, onRejected) {
        // 1. 参数校验和值穿透
        onFulfilled =
            typeof onFulfilled === "function" ? onFulfilled : (v) => v;
        onRejected =
            typeof onRejected === "function"
                ? onRejected
                : (e) => {
                      throw e;
                  };

        // 注册返回值，then返回的应该是一个新的MyPromise对象
        const newPromise = new MyPromise((resolve, reject) => {
            // 如果是fulfilled状态则进入onFulfilled分支
            if (this.state === "fulfilled") {
                // 使用微任务执行then方法，保证它是一个异步函数
                queueMicrotask(() => {
                    try {
                        const x = onFulfilled(this.value);

                        // 处理then最终的返回状态
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            // 如果是fulfilled状态则进入onRejected分支
            if (this.state === "rejected") {
                // 使用微任务执行then方法，保证它是一个异步函数
                queueMicrotask(() => {
                    try {
                        const x = onRejected(this.reason);

                        // 处理then最终的返回状态
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            // 如果仍然是pending状态就先注册回调，等到结果产生后再由对应的函数逐个调用处理
            if (this.state === "pending") {
                // 复用上面fulfilled的逻辑
                this.onFulfilledCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onFulfilled(this.value);
                            resolvePromise(newPromise, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });

                // 复用上面rejected的逻辑
                this.onRejectedCallbacks.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onRejected(this.reason);
                            resolvePromise(newPromise, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }
        });

        // 返回then方法的新Promise对象返回值
        return newPromise;
    }
}

const promise = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("promise resolved");
    }, 3000);
    console.log("promise set");
});
promise
    .then((value) => {
        console.log(value);
        return value;
    })
    .then((value) => {
        console.log("second then function called: ", value);
    });
