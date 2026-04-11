/*
94. 二叉树的中序遍历
给定一个二叉树的根节点 root ，返回它的中序遍历 。

示例 1：
输入：root = [1,null,2,3]
输出：[1,3,2]

示例 2：
输入：root = []
输出：[]

示例 3：
输入：root = [1]
输出：[1]

提示：
树中节点数目在范围 [0, 100] 内
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
var inorderTraversal = function (root) {
    const res = [];
    if (!root) return res;
    if (root.left) {
        res.push(...inorderTraversal(root.left));
        res.push(root.val);
        if (root.right) {
            res.push(...inorderTraversal(root.right));
        }
    } else {
        res.push(root.val);
        if (root.right) {
            res.push(...inorderTraversal(root.right));
        }
    }
    return res;
};

// 简洁写法
var inorderTraversal = function (root) {
    const res = [];
    if (!root) return res;

    res.push(...inorderTraversal(root.left));
    res.push(root.val);
    res.push(...inorderTraversal(root.right));

    return res;
};
