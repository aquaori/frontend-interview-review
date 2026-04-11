/*
42. 接雨水
给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

示例 1：
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。 

示例 2：
输入：height = [4,2,0,3,2,5]
输出：9

提示：
n == height.length
1 <= n <= 2 * 104
0 <= height[i] <= 105
*/

/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function (height) {
    let res = 0;
    const len = height.length;
    let l = 0;
    let r = len - 1;
    let lMax = height[l];
    let rMax = height[r];
    while (l < r) {
        if (lMax < rMax) {
            l++;
            if (lMax < height[l]) lMax = height[l];
            res += lMax - height[l];
        } else if (lMax >= rMax) {
            r--;
            if (rMax < height[r]) rMax = height[r];
            res += rMax - height[r];
        }
    }
    return res;
};
