function debounce(fn, delay, immediate = false) {
    let timer = null;
    return function (cancel = false, ...args) {
        if (immediate && !timer) {
            fn.apply(this, args);
        }

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        if (!cancel) {
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        }
    };
}

let count = 0;

function test() {
    console.log("fn被调用");
    count++;
}

const debounceTest = debounce(test, 500, true);

const interval = setInterval(() => {
    console.log("尝试调用fn");
    debounceTest();
}, 100);

setTimeout(() => {
    clearInterval(interval);
    console.log("等待中");
    setTimeout(() => {
        console.log(`fn被调用了${count}次`);
    }, 1000);
}, 1000);
