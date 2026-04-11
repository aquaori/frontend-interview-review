function partial(fn, ...args) {
    return function (...rest) {
        const totalArgs = args.concat(rest);
        return fn.apply(this, totalArgs);
    };
}

function sum(a, b, c) {
    return a + b + c;
}

const partialed = partial(sum, 1, 2);
console.log(partialed(3));
console.log(partialed(4));
console.log(partialed(5));
