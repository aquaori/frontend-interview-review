/*
560. 和为 K 的子数组
给你一个整数数组 nums 和一个整数 k ，请你统计并返回 该数组中和为 k 的子数组的个数 。
注：子数组是数组中元素的连续非空序列。

示例 1：
输入：nums = [1,1,1], k = 2
输出：2

示例 2：
输入：nums = [1,2,3], k = 3
输出：2

提示：

1 <= nums.length <= 2 * 104
-1000 <= nums[i] <= 1000
-107 <= k <= 107
*/

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraySum = function (nums, k) {
    const prefixs = new Map();
    const prefixFrequencies = new Map([[0, 1]]);
    let res = 0;
    for (let i = 0; i < nums.length; i++) {
        const pre = prefixs.get(i - 1) ?? 0;
        const sum = pre + nums[i];
        const diff = sum - k;
        if (prefixFrequencies.has(diff)) {
            res += prefixFrequencies.get(diff);
        }
        prefixs.set(i, sum);
        prefixFrequencies.has(sum)
            ? prefixFrequencies.set(sum, prefixFrequencies.get(sum) + 1)
            : prefixFrequencies.set(sum, 1);
    }
    return res;
};
