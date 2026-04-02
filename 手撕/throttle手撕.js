function throttle(fn, delay, options = {}) {
    const { leading = true, trailing = true } = options;

    // timer: 控制尾调用
    let timer = null;
    // lastCallTime: 上一次真正执行 fn 的时间
    let lastCallTime = 0;
    // lastArgs / lastThis: 记录节流窗口内最后一次调用的参数和 this
    let lastArgs = null;
    let lastThis = null;

    function invoke(time) {
        lastCallTime = time;
        fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
    }

    function startTimer(remaining) {
        timer = setTimeout(() => {
            timer = null;

            // 节流窗口结束后，如果窗口内还有调用，就补最后一次
            if (trailing && lastArgs) {
                invoke(Date.now());
            }
        }, remaining);
    }

    function throttled(...args) {
        const now = Date.now();

        // leading=false 时，第一次调用不立刻执行，而是先把起点记下来
        if (!lastCallTime && leading === false) {
            lastCallTime = now;
        }

        const remaining = delay - (now - lastCallTime);
        lastArgs = args;
        lastThis = this;

        // 已经过了节流间隔，直接执行
        if (remaining <= 0 || remaining > delay) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            invoke(now);
        // 还没到执行时间，且允许尾调用，则挂一个定时器等窗口结束
        } else if (!timer && trailing) {
            startTimer(remaining);
        }
    }

    throttled.cancel = function () {
        // 取消等待中的尾调用，并重置内部状态
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        lastCallTime = 0;
        lastArgs = lastThis = null;
    };

    return throttled;
}

function createLogger(label) {
    const start = Date.now();

    return function (message) {
        console.log(`[${label}] ${Date.now() - start}ms ${message}`);
    };
}

function scheduleCalls(delays, callback, onDone) {
    delays.forEach((delay, index) => {
        setTimeout(() => {
            callback(index + 1);
        }, delay);
    });

    const lastDelay = delays[delays.length - 1] || 0;
    setTimeout(onDone, lastDelay + 50);
}

function runLeadingAndTrailingTest(done) {
    const log = createLogger("leading+trailing");
    let count = 0;

    function task(value) {
        count++;
        log(`fn executed, value=${value}, count=${count}`);
    }

    const throttled = throttle(task, 500, {
        leading: true,
        trailing: true,
    });

    scheduleCalls([0, 100, 200], (value) => {
        log(`call throttled, value=${value}`);
        throttled(value);
    }, () => {
        log("stop calling");

        setTimeout(() => {
            log(`final count=${count}, expected=2`);
            done();
        }, 700);
    });
}

function runTrailingOnlyTest(done) {
    const log = createLogger("trailing-only");
    let count = 0;

    function task(value) {
        count++;
        log(`fn executed, value=${value}, count=${count}`);
    }

    const throttled = throttle(task, 500, {
        leading: false,
        trailing: true,
    });

    scheduleCalls([0, 100, 200], (value) => {
        log(`call throttled, value=${value}`);
        throttled(value);
    }, () => {
        log("stop calling");

        setTimeout(() => {
            log(`final count=${count}, expected=1`);
            done();
        }, 700);
    });
}

function runCancelTest(done) {
    const log = createLogger("cancel");
    let count = 0;

    function task(value) {
        count++;
        log(`fn executed, value=${value}, count=${count}`);
    }

    const throttled = throttle(task, 500, {
        leading: true,
        trailing: true,
    });

    log("call throttled first time");
    throttled("first");

    setTimeout(() => {
        log("call throttled second time, should schedule trailing");
        throttled("second");
    }, 100);

    setTimeout(() => {
        log("cancel pending trailing");
        throttled.cancel();
    }, 300);

    setTimeout(() => {
        log(`final count=${count}, expected=1`);
        done();
    }, 800);
}

runLeadingAndTrailingTest(() => {
    console.log("--------------------------------");

    runTrailingOnlyTest(() => {
        console.log("--------------------------------");

        runCancelTest(() => {
            console.log("all tests finished");
        });
    });
});
