function once(fn) {
    let result = null;
    let called = false;
    return function (...args) {
        if (!called) {
            result = fn.apply(this, args);
            called = true;
            return result;
        } else {
            return result;
        }
    };
}

function plus(a, b) {
    return a + b;
}

const onced = once(plus);

console.log(onced(1, 2));
console.log(onced(2, 5));
console.log(onced(3, 6));
