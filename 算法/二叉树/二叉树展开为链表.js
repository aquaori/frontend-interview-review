/*
114. 二叉树展开为链表
给你二叉树的根结点 root ，请你将它展开为一个单链表：
展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。
展开后的单链表应该与二叉树 先序遍历 顺序相同。

示例 1：
输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]

示例 2：
输入：root = []
输出：[]

示例 3：
输入：root = [0]
输出：[0]

提示：
树中结点数在范围 [0, 2000] 内
-100 <= Node.val <= 100

进阶：你可以使用原地算法（O(1) 额外空间）展开这棵树吗？
*/
/*
说一下这道题的O(1)思路：
对于一个二叉树，我们可以使用 Morris 遍历的思想来实现 O(1) 额外空间的展开。具体步骤如下：
如果当前节点有左子树，就找到左子树中最右边的节点，将当前节点的右子树连接到该节点的右指针上，然后将当前节点的左子树移动到右子树的位置，并将左指针置为 null。
按照这个方法循环遍历二叉树，直到所有节点都被处理完毕。这样就可以在原地展开二叉树为链表，而不需要使用额外的空间来存储节点。
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
 * @return {void} Do not return anything, modify root in-place instead.
 */
var flatten = function (root) {
    if (!root) return;

    let curr = root;
    while (curr) {
        if (curr.left) {
            let prev = curr.left;
            while (prev.right) {
                prev = prev.right;
            }
            prev.right = curr.right;
            curr.right = curr.left;
            curr.left = null;
        }
        curr = curr.right;
    }
};
