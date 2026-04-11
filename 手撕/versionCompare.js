function compareVersion(v1, v2) {
    let v1Arr = v1.split(".");
    let v2Arr = v2.split(".");
    const n = Math.max(v1Arr.length, v2Arr.length) - 1;
    for (let i = 0; i <= n; i++) {
        const a = Number(v1Arr[i] ?? "0");
        const b = Number(v2Arr[i] ?? "0");
        if (a > b) return 1;
        else if (a < b) return -1;
    }
    return 0;
}

console.log(compareVersion("1.0.0", "1.0.0"));
console.log(compareVersion("1.1.0", "1.0.0"));
console.log(compareVersion("1.0.0", "1.2.0"));
console.log(compareVersion("1.0.0", "1.2"));
console.log(compareVersion("0", "0"));
