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

/*
由于这一题在面试中的考频极高，因此为了方便复习，在这里写一下实现思路：
1.首先定义一个集合set
2.再把传进来的字符串s使用Array.from转为以单个字符为元素的数组arr
3.定义返回值res（如果题目要求返回最大长度，则默认值为0，如果是返回最长字符，那默认值就是空数组[]，方便后续比较）
4.使用Set.values()获取集合set的迭代对象，方便当字符重复时滑动窗口左边界右移，挤出前面的字符串
5.遍历字符数组arr
6.判断set中是否含有当前遍历的字符i
7.如果没有，则滑动窗口右边界右移：
    - 往set里添加字符i
    - 更新返回值res（如果是长度则使用Math.max取res和set.size两者的最大值，如果是字符串数组则使用Math.max和res.length比较最大长度）
8.如果有，则滑动窗口左边界右移：
    - 使用while循环不断判断set是否含有当前遍历的字符i
    - 如果有，就使用迭代器的.next().value方法获取下一个元素（即set当前的第一个元素）的值并使用Set.delete()方法删除这个元素，然后再进行下一轮while判断，直到删到i不存在为止
    - 如果没有，就往set里添加字符i（不需要更新res的大小，因为此时set经历过删除操作，它的size一定是 <= res的，比较最大长度没有意义）
9.返回res（如果res是字符串数组，要根据题目要求，使用join拼接成字符串返回）
*/

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    // 1.首先定义一个集合set
    const set = new Set();
    // 2.再把传进来的字符串s使用Array.from转为以单个字符为元素的数组arr
    const arr = Array.from(s);
    // 3.定义返回值res（如果题目要求返回最大长度，则默认值为0，如果是返回最长字符，那默认值就是空数组[]，方便后续比较）
    let res = 0;
    // 4.使用Set.values()获取集合set的迭代对象，方便当字符重复时滑动窗口左边界右移，挤出前面的字符串
    const iterator = set.values();
    // 5.遍历字符数组arr
    for (i of arr) {
        // 6.判断set中是否含有当前遍历的字符i
        // 7.如果没有，则滑动窗口右边界右移
        if (!set.has(i)) {
            // 往set里添加字符i
            set.add(i);
            // 更新返回值res（如果是长度则使用Math.max取res和set.size两者的最大值，如果是字符串数组则使用Math.max和res.length比较最大长度）
            res = Math.max(res, set.size);
        } else {
            // 8.如果有，则滑动窗口左边界右移：
            // 使用while循环不断判断set是否含有当前遍历的字符i
            while (set.has(i)) {
                // 如果有，就使用迭代器的.next().value方法获取下一个元素（即set当前的第一个元素）的值
                const first = iterator.next().value;
                // 使用Set.delete()方法删除这个元素，然后再进行下一轮while判断，直到删到i不存在为止
                set.delete(first);
            }
            // 如果没有，就往set里添加字符i（不需要更新res的大小，因为此时set经历过删除操作，它的size一定是 <= res的，比较最大长度没有意义）
            set.add(i);
        }
    }
    // 9.返回res（如果res是字符串数组，要根据题目要求，使用join拼接成字符串返回）
    return res;
};

// 进阶写法：
var lengthOfLongestSubstring = function (s) {
    // 存储当前窗口的无重复字符
    const set = new Set();
    // 存储最长无重复子串长度
    let res = 0;

    // 直接遍历字符串，无需转数组，循环变量正确声明
    for (const char of s) {
        // 遇到重复字符，收缩左边界，直到窗口内无当前字符
        while (set.has(char)) {
            // 每次循环重新生成迭代器，获取当前set的第一个元素
            const iterator = set.values();
            const firstChar = iterator.next().value;
            set.delete(firstChar);
        }
        // 把当前字符加入窗口
        set.add(char);
        // 每次窗口变化后都更新最大长度，避免遗漏
        res = Math.max(res, set.size);
    }

    return res;
};

// 最优写法：
var lengthOfLongestSubstring = function (s) {
    // 滑动窗口左指针
    let left = 0;
    // 存储最长子串长度
    let maxLen = 0;
    // 存储字符的最新索引，O(1)查找重复字符的位置
    const charMap = new Map();

    // 右指针遍历字符串，扩展窗口右边界
    for (let right = 0; right < s.length; right++) {
        const currentChar = s[right];
        // 如果当前字符在窗口内，直接把左指针跳到重复字符的下一位
        if (charMap.has(currentChar) && charMap.get(currentChar) >= left) {
            left = charMap.get(currentChar) + 1;
        }
        // 更新当前字符的最新索引
        charMap.set(currentChar, right);
        // 更新最大长度
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
};
