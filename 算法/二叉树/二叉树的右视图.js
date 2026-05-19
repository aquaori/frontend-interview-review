/*
199. 二叉树的右视图
给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。

示例 1：
输入：root = [1,2,3,null,5,null,4]
输出：[1,3,4]

示例 2：
输入：root = [1,2,3,4,null,null,null,5]
输出：[1,3,4,5]

示例 3：
输入：root = [1,null,3]
输出：[1,3]

示例 4：
输入：root = []
输出：[]

提示:
二叉树的节点个数的范围是 [0,100]
-100 <= Node.val <= 100 
*/

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var rightSideView = function (root) {
    if (!root) return [];
    let queue = [root];
    const result = [];
    while (queue.length) {
        let len = queue.length;
        let level = null;
        for (let i = 0; i < len; i++) {
            const head = queue.shift();
            if (i === len - 1) level = head.val;
            if (head.left) queue.push(head.left);
            if (head.right) queue.push(head.right);
        }

        result.push(level);
    }
    return result;
};
