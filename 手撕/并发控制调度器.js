/*
问题拆解：
1.维护一个执行池
    - 用数组记录正在执行的任务，控制数量不超过上限
2.设计等待队列
    - 超出并发数的任务进入队列，等待空位
3.自动调度机制
    - 每完成一个任务，立即从队列中取出下一个执行
*/

class Schedule {
    constructor(max) {
        this.max = max; // 最大并发数
        this.running = []; // 正在执行的任务（执行池）
        this.queue = []; //等待队列
        this.solved = []; // 已完成的队列
    }

    // 添加一个新任务并等待完成返回
    add(task) {
        return new Promise((resolve) => {
            // 向等待队列里push一个新的task，包含task本身，以及add函数的resolve回调
            this.queue.push({ task, resolve });

            // 尝试开始这个任务，如果执行池满了就等待调度
            this.run();
        });
    }

    // 调度器（关键）
    run() {
        // 只有两种情况都满足时才执行下一个任务：
        //  - 1.执行池数量少于最大并发数
        //  - 2.等待队列中还有未执行的任务
        while (this.running.length < this.max && this.queue.length) {
            // 取出队列最前面的任务
            const { task, resolve } = this.queue.shift();

            // 执行任务
            const promise = task().then((result) => {
                // 执行完成后拉起add回调
                resolve(result);

                // 返回结果，中止运行
                return result;
            });

            // 把任务push到执行队列中
            this.running.push(promise);

            promise.finally(() => {
                // 执行结束后把自己从执行队列中删掉
                this.running.splice(this.running.indexOf(promise), 1);

                // 开启下一轮执行调度（实现自动调度机制的关键）
                this.run();
            });
        }
    }
}

function createTask(name, delay, tracker) {
    return () =>
        new Promise((resolve) => {
            tracker.current++;
            tracker.maxSeen = Math.max(tracker.maxSeen, tracker.current);
            console.log(`任务 ${name} 开始，当前并发: ${tracker.current}`);

            setTimeout(() => {
                tracker.current--;
                console.log(`任务 ${name} 结束，当前并发: ${tracker.current}`);
                resolve(name);
            }, delay);
        });
}

const scheduler = new Schedule(3);
const tracker = {
    current: 0,
    maxSeen: 0,
};

Promise.all([
    scheduler.add(createTask("A", 1000, tracker)),
    scheduler.add(createTask("B", 500, tracker)),
    scheduler.add(createTask("C", 300, tracker)),
    scheduler.add(createTask("D", 400, tracker)),
]).then((results) => {
    console.log("测试结果，任务完成顺序按添加顺序返回:", results);
    console.log("测试结果，观察到的最大并发数:", tracker.maxSeen);
});
