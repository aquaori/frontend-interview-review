/*
46. 全排列
给定一个不含重复数字的数组 nums ，返回其所有可能的全排列。你可以按任意顺序返回答案。

示例 1：
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

示例 2：
输入：nums = [0,1]
输出：[[0,1],[1,0]]

示例 3：
输入：nums = [1]
输出：[[1]]

提示：
1 <= nums.length <= 6
-10 <= nums[i] <= 10
nums 中的所有整数 互不相同
*/

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
    if (!nums) return nums;
    const res = [];
    let path = [];
    const len = nums.length;
    let used = new Array(nums.length).fill(false);
    function dfs(length) {
        if (length === len) {
            res.push([...path]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            path.push(nums[i]);
            used[i] = true;
            dfs(length + 1);
            path.pop();
            used[i] = false;
        }
    }
    dfs(0);
    return res;
};
