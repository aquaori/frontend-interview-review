/*
思路：
从数组origin的最后一个元素开始往前遍历
每次遍历都从[0,i]的闭区间范围内抽取一位元素j
将i元素与j元素互换位置
*/
function wash(origin) {
    for (let i = origin.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [origin[i], origin[j]] = [origin[j], origin[i]];
    }
    return origin;
}
const origin = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let i = 0;
while (i < 10) {
    console.log(`第${i + 1}次：` + wash(origin));
    i++;
}

/*
进阶：取k个不重复元素
从数组origin的第一个元素开始往后遍历
每次遍历都从[i,origin.length]的闭区间范围内抽取一位元素j
将i元素与j元素互换位置
当遍历到i=k时，结束循环，使用slice截取数组[0,k]的子数组返回
*/
