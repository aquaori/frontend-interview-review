/*
3. 无重复字符的最长子串
给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。
注：字串是指子字符串是字符串中连续的非空字符序列。

示例 1:
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。注意 "bca" 和 "cab" 也是正确答案。

示例 2:
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。

示例 3:
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
    请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。

提示：

0 <= s.length <= 5 * 104
s 由英文字母、数字、符号和空格组成
*/

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    const set = new Set();
    const arr = Array.from(s);
    let res = 0;
    const iterator = set.values();
    for (i of arr) {
        if (!set.has(i)) {
            set.add(i);
            res = Math.max(res, set.size);
        } else {
            while (set.has(i)) {
                const first = iterator.next().value;
                set.delete(first);
            }
            set.add(i);
        }
    }
    return res;
};
