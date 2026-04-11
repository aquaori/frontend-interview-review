/*
994. 腐烂的橘子
在给定的 m x n 网格 grid 中，每个单元格可以有以下三个值之一：
值 0 代表空单元格；
值 1 代表新鲜橘子；
值 2 代表腐烂的橘子。
每分钟，腐烂的橘子 周围 4 个方向上相邻 的新鲜橘子都会腐烂。
返回 直到单元格中没有新鲜橘子为止所必须经过的最小分钟数。如果不可能，返回 -1 。

示例 1：
输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
输出：4

示例 2：
输入：grid = [[2,1,1],[0,1,1],[1,0,1]]
输出：-1
解释：左下角的橘子（第 2 行， 第 0 列）永远不会腐烂，因为腐烂只会发生在 4 个方向上。

示例 3：
输入：grid = [[0,2]]
输出：0
解释：因为 0 分钟时已经没有新鲜橘子了，所以答案就是 0 。

提示：
m == grid.length
n == grid[i].length
1 <= m, n <= 10
grid[i][j] 仅为 0、1 或 2
*/

/**
 * @param {number[][]} grid
 * @return {number}
 */
var orangesRotting = function (grid) {
    let badQueue = [];
    let goodCount = 0;
    let res = 0;
    const rows = grid.length;
    const cols = grid[0].length;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 1) goodCount++;
            else if (grid[i][j] === 2) badQueue.push([i, j]);
        }
    }
    while (badQueue.length !== 0 && goodCount > 0) {
        const bads = badQueue;
        badQueue = [];
        bads.forEach((bad) => {
            const r = bfs(grid, bad[0], bad[1], rows, cols);
            if (r.length > 0) badQueue.push(...r);
            goodCount -= r.length;
        });
        res++;
    }
    if (goodCount > 0) return -1;
    else return res;
};

var bfs = function (grid, i, j, rows, cols) {
    let r = [];
    if (turnBad(grid, i - 1, j, rows, cols)) r.push([i - 1, j]);
    if (turnBad(grid, i + 1, j, rows, cols)) r.push([i + 1, j]);
    if (turnBad(grid, i, j - 1, rows, cols)) r.push([i, j - 1]);
    if (turnBad(grid, i, j + 1, rows, cols)) r.push([i, j + 1]);

    return r;
};

var turnBad = function (grid, i, j, rows, cols) {
    if (
        i < 0 ||
        i >= rows ||
        j < 0 ||
        j >= cols ||
        !grid[i] ||
        grid[i][j] !== 1
    ) {
        return false;
    }
    grid[i][j] = 2;
    return true;
};
