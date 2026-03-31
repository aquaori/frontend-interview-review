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
            if (called) return;
            called = true;
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
            if (this.state !== "pending") return;

            // 1. 不能 resolve 自己
            if (value === this) {
                return reject(
                    new TypeError("Chaining cycle detected for promise"),
                );
            }

            // 2. 如果是 MyPromise，直接跟随它
            if (value instanceof MyPromise) {
                return value.then(resolve, reject);
            }

            // 3. 如果是 thenable，也跟随它
            if (
                value !== null &&
                (typeof value === "object" || typeof value === "function")
            ) {
                let called = false;

                try {
                    const then = value.then;

                    if (typeof then === "function") {
                        return then.call(
                            value,
                            (y) => {
                                if (called) return;
                                called = true;
                                resolve(y);
                            },
                            (r) => {
                                if (called) return;
                                called = true;
                                reject(r);
                            },
                        );
                    }
                } catch (error) {
                    if (called) return;
                    return reject(error);
                }
            }

            // 4. 普通值，正常 fulfilled
            this.state = "fulfilled";
            this.value = value;
            this.onFulfilledCallbacks.forEach((fn) => fn());
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

            // 如果是rejected状态则进入onRejected分支
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

    // catch 方法
    catch(onRejected) {
        return this.then(null, onRejected);
    }

    // finally 方法
    finally(cb) {
        return this.then(
            (value) => MyPromise.resolve(cb()).then(() => value),
            (reason) =>
                MyPromise.resolve(cb()).then(() => {
                    throw reason;
                }),
        );
    }
}

// all 方法
MyPromise.all = function (promises) {
    return new MyPromise((resolve, reject) => {
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
            MyPromise.resolve(promise).then(
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

// allSettled 方法
MyPromise.allSettled = function (promises) {
    return new MyPromise((resolve, reject) => {
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
            MyPromise.resolve(promise)
                .then(
                    (value) => {
                        // 使用index将结果按序加入返回数组
                        results[index] = {
                            status: "fulfilled",
                            value: value,
                        };
                    },
                    (reason) => {
                        // 如果有某个promise reject了，不中止myAll的运行，而是记录到results中一起返回
                        results[index] = {
                            status: "rejected",
                            reason: reason,
                        };
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

// race 方法
MyPromise.race = function (promises) {
    return new MyPromise((resolve, reject) => {
        // 遍历promises数组并执行
        promises.forEach((promise) => {
            // 执行并返回第一个promise的resolve或reject
            MyPromise.resolve(promise).then(resolve, reject);
        });
    });
};

// any 方法
MyPromise.any = function (promises) {
    return new MyPromise((resolve, reject) => {
        // 边界处理：如果传进来的promises没有任何promise，就立即resolve返回
        if (promises.length === 0) {
            return reject(new AggregateError([], "All promises were rejected"));
        }

        // 定义完成数量和错误信息数组
        let count = 0;
        const errors = [];

        // 遍历promises数组并执行
        promises.forEach((promise, index) => {
            MyPromise.resolve(promise).then(
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

// MyPromise.resolve 方法
MyPromise.resolve = function (value) {
    return new MyPromise((resolve) => resolve(value));
};

// MyPromise.reject 方法
MyPromise.reject = function (reason) {
    return new MyPromise((_, reject) => reject(reason));
};

// 测试用例

// ========== 1. 基础 resolve ==========
new MyPromise((resolve) => {
    resolve(123);
}).then((res) => {
    console.log("测试1:", res); // 预期: 123
});

// ========== 2. 基础 reject ==========
new MyPromise((resolve, reject) => {
    reject("fail");
}).catch((err) => {
    console.log("测试2:", err); // 预期: fail
});

// ========== 3. then 链式调用 ==========
new MyPromise((resolve) => {
    resolve(1);
})
    .then((res) => res + 1)
    .then((res) => res + 1)
    .then((res) => {
        console.log("测试3:", res); // 预期: 3
    });

// ========== 4. then 返回一个新的 MyPromise ==========
new MyPromise((resolve) => {
    resolve(10);
})
    .then((res) => {
        return new MyPromise((resolve) => {
            setTimeout(() => resolve(res * 2), 100);
        });
    })
    .then((res) => {
        console.log("测试4:", res); // 预期: 20
    });

// ========== 5. 构造器里的 resolve 吸收 MyPromise ==========
new MyPromise((resolve) => {
    resolve(
        new MyPromise((r) => {
            setTimeout(() => r(999), 100);
        }),
    );
}).then((res) => {
    console.log("测试5:", res); // 预期: 999
});

// ========== 6. 构造器里的 resolve 吸收 thenable ==========
new MyPromise((resolve) => {
    resolve({
        then(res) {
            setTimeout(() => res("thenable success"), 100);
        },
    });
}).then((res) => {
    console.log("测试6:", res); // 预期: thenable success
});

// ========== 7. 异常捕获 ==========
new MyPromise((resolve) => {
    resolve(1);
})
    .then(() => {
        throw new Error("boom");
    })
    .catch((err) => {
        console.log("测试7:", err.message); // 预期: boom
    });

// ========== 8. 值穿透 ==========
new MyPromise((resolve) => {
    resolve("hello");
})
    .then()
    .then()
    .then((res) => {
        console.log("测试8:", res); // 预期: hello
    });

// ========== 9. reject 穿透 ==========
new MyPromise((resolve, reject) => {
    reject("error");
})
    .then()
    .then()
    .catch((err) => {
        console.log("测试9:", err); // 预期: error
    });

// ========== 10. finally 成功分支 ==========
new MyPromise((resolve) => {
    resolve("ok");
})
    .finally(() => {
        console.log("测试10 finally");
    })
    .then((res) => {
        console.log("测试10:", res); // 预期: ok
    });

// ========== 11. finally 失败分支 ==========
new MyPromise((resolve, reject) => {
    reject("bad");
})
    .finally(() => {
        console.log("测试11 finally");
    })
    .catch((err) => {
        console.log("测试11:", err); // 预期: bad
    });

// ========== 12. MyPromise.resolve ==========
MyPromise.resolve(555).then((res) => {
    console.log("测试12:", res); // 预期: 555
});

// ========== 13. MyPromise.reject ==========
MyPromise.reject("reject test").catch((err) => {
    console.log("测试13:", err); // 预期: reject test
});

// ========== 14. MyPromise.all 全成功 ==========
MyPromise.all([
    MyPromise.resolve(1),
    2,
    new MyPromise((resolve) => setTimeout(() => resolve(3), 100)),
]).then((res) => {
    console.log("测试14:", res); // 预期: [1, 2, 3]
});

// ========== 15. MyPromise.all 有一个失败 ==========
MyPromise.all([
    MyPromise.resolve(1),
    new MyPromise((resolve, reject) =>
        setTimeout(() => reject("all fail"), 50),
    ),
    3,
])
    .then((res) => {
        console.log("测试15:", res);
    })
    .catch((err) => {
        console.log("测试15:", err); // 预期: all fail
    });

// ========== 16. MyPromise.allSettled ==========
MyPromise.allSettled([MyPromise.resolve("A"), MyPromise.reject("B"), 100]).then(
    (res) => {
        console.log("测试16:", res);
        // 预期:
        // [
        //   { status: 'fulfilled', value: 'A' },
        //   { status: 'rejected', reason: 'B' },
        //   { status: 'fulfilled', value: 100 }
        // ]
    },
);

// ========== 17. MyPromise.race 成功 ==========
MyPromise.race([
    new MyPromise((resolve) => setTimeout(() => resolve("first"), 50)),
    new MyPromise((resolve) => setTimeout(() => resolve("second"), 100)),
]).then((res) => {
    console.log("测试17:", res); // 预期: first
});

// ========== 18. MyPromise.race 失败 ==========
MyPromise.race([
    new MyPromise((resolve, reject) =>
        setTimeout(() => reject("race fail"), 50),
    ),
    new MyPromise((resolve) => setTimeout(() => resolve("success"), 100)),
])
    .then((res) => {
        console.log("测试18:", res);
    })
    .catch((err) => {
        console.log("测试18:", err); // 预期: race fail
    });

// ========== 19. MyPromise.any 成功 ==========
MyPromise.any([
    MyPromise.reject("x"),
    new MyPromise((resolve) => setTimeout(() => resolve("any success"), 100)),
    MyPromise.reject("y"),
]).then((res) => {
    console.log("测试19:", res); // 预期: any success
});

// ========== 20. MyPromise.any 全失败 ==========
MyPromise.any([
    MyPromise.reject("e1"),
    new MyPromise((resolve, reject) => setTimeout(() => reject("e2"), 50)),
]).catch((err) => {
    console.log("测试20:", err.message); // 预期: All promises were rejected
    console.log("测试20 errors:", err.errors); // 预期: ['e1', 'e2']
});

// ========== 21. 链式循环引用检测 ==========
const p = MyPromise.resolve(1);
const p2 = p.then(() => {
    return p2;
});
p2.catch((err) => {
    console.log("测试21:", err.message); // 预期: Chaining cycle detected for promise
});
