/*
438. 找到字符串中所有字母异位词
给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

示例 1:
输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。

示例 2:
输入: s = "abab", p = "ab"
输出: [0,1,2]
解释:
起始索引等于 0 的子串是 "ab", 它是 "ab" 的异位词。
起始索引等于 1 的子串是 "ba", 它是 "ab" 的异位词。
起始索引等于 2 的子串是 "ab", 它是 "ab" 的异位词。
 

提示:
1 <= s.length, p.length <= 3 * 104
s 和 p 仅包含小写字母
*/

/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
var findAnagrams = function (s, p) {
    const arr = Array.from(p);
    const sorted = arr.toSorted();
    const len = arr.length;
    const sArr = Array.from(s);
    const window = sArr.slice(0, len);
    const res = [];
    if (sArr.length < len) return [];
    sArr.forEach((val, key) => {
        if (key < len - 1) return;
        if (isSameArray(sorted, window.toSorted())) {
            res.push(key - len + 1);
        }
        window.shift();
        if (sArr[key + 1]) window.push(sArr[key + 1]);
    });
    return res;
};

function isSameArray(arr1, arr2) {
    for (let i = 0; i < 26; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
