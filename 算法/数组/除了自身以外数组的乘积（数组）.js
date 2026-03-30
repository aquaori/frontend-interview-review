/*
238. 除了自身以外数组的乘积
给你一个整数数组 nums，返回 数组 answer ，其中 answer[i] 等于 nums 中除了 nums[i] 之外其余各元素的乘积 。
题目数据 保证 数组 nums之中任意元素的全部前缀元素和后缀的乘积都在  32 位 整数范围内。
* 请不要使用除法，且在 O(n) 时间复杂度内完成此题。

示例 1:
输入: nums = [1,2,3,4]
输出: [24,12,8,6]

示例 2:
输入: nums = [-1,1,0,-3,3]
输出: [0,0,9,0,0]

提示：
2 <= nums.length <= 105
-30 <= nums[i] <= 30
输入保证数组 answer[i] 在 32 位整数范围内
*/

/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function (nums) {
    const maxIdx = nums.length - 1;
    const positive = [nums[0]];
    const negative = [nums[maxIdx]];
    const res = [];
    for (let i = 1; i < maxIdx + 1; i++) {
        positive.push(positive[i - 1] * nums[i]);
        negative.push(negative[i - 1] * nums[maxIdx - i]);
    }
    for (let i = 0; i < maxIdx + 1; i++) {
        const pre = positive[i - 1] ?? 1;
        const aft = negative[maxIdx - i - 1] ?? 1;
        res.push(pre * aft);
    }
    return res;
};
