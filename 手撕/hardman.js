/*
实现一个 HardMan 异步流程控制题
要求：
    - HardMan(name) 立即输出：Hi! I am {name}
    - 支持 .study(something)：立即输出 I am study {something}
    - 支持 .wait(seconds)：等待 seconds 秒后，输出Wait x seconds，再执行后续任务
    - 支持 .waitFirst(seconds)：**先等待 seconds 秒**，输出Wait x seconds，再执行所有任务
    - 所有方法支持链式调用
    - 任务按正确异步顺序执行
*/

// 阻塞线程指定时间，核心是使用Promise异步线程+SetTimeout延迟resolve实现
async function sleep(seconds) {
    await new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Wait ${seconds} seconds.`);
            resolve();
        }, seconds * 1000);
    });
}

// 函数式类的写法
function hardManClass(name) {
    this.tasks = []; // 任务队列

    // 等待同步代码全部执行完成后再统一遍历运行
    setTimeout(async () => {
        for (let task of this.tasks) {
            await task();
        }
    }, 0); // 核心：将执行步骤注册成异步回调函数，等待同步代码运行完成后才检查事件循环回调，实现先收集再执行

    // 开始前先打印一个start信息
    this.tasks.push(() => {
        return new Promise((resolve) => {
            console.log(`Hi! I am ${name}.`);
            resolve();
        });
    });

    // study事件，即HardMan做某件事
    this.study = function (studyName) {
        this.tasks.push(() => {
            // 所有事件都要是异步的，才能串行执行
            return new Promise((resolve) => {
                console.log(`I am studying ${studyName}.`);
                resolve();
            });
        });
        return this;
    };

    // rest事件，即上一个事件结束后等待指定时间后再执行下一个事件
    this.rest = function (time) {
        // 所有事件都要是异步的，才能串行执行
        this.tasks.push(async () => {
            await sleep(time);
        });
        return this;
    };

    // restFirst事件，即在所有事件（包括start事件）开始执行前先等待指定时间，然后再开始执行
    this.restFirst = function (time) {
        // 所有事件都要是异步的，才能串行执行
        this.tasks.unshift(async () => {
            await sleep(time);
        });
        return this;
    };

    // 支持链式调用
    return this;
}

function hardMan(name) {
    return new hardManClass(name);
}

hardMan("潘潘").rest(3).study("敲码").restFirst(2);
