/*
考察点：JavaScript Number类型无法精确存储大数，对大数进行四则运算时会丢失精度
解决方案：BigInt、竖式计算
*/

function addBigNumber(a, b) {
    // 初始化结果字符串和进位值
    let result = "";
    let carry = 0;

    // 使用双指针i、j分别指向两个字符串的末尾
    let i = a.length - 1;
    let j = b.length - 1;

    // 循环条件：只要还有数字或进位，就继续计算
    while (i >= 0 || j >= 0 || carry > 0) {
        const num1 = i >= 0 ? Number(a[i]) : 0;
        const num2 = j >= 0 ? Number(b[j]) : 0;

        const sum = num1 + num2 + carry;

        carry = Math.floor(sum / 10);

        result = (sum % 10) + result;

        i--;
        j--;
    }
    return result;
}

console.log(addBigNumber("123456789123456789", "456123987123654987"));
