/*
200. 岛屿数量
给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。
此外，你可以假设该网格的四条边均被水包围。

示例 1：
输入：grid = [
  ['1','1','1','1','0'],
  ['1','1','0','1','0'],
  ['1','1','0','0','0'],
  ['0','0','0','0','0']
]
输出：1

示例 2：
输入：grid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1']
]
输出：3

提示：
m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] 的值为 '0' 或 '1'
*/

/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
    if (!grid || grid.length === 0) return 0;

    let res = 0;
    const rows = grid.length;
    const cols = grid[0].length;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === "1") {
                res++;
                dfs(grid, i, j, rows, cols);
            }
        }
    }

    return res;
};

function dfs(grid, i, j, rows, cols) {
    if (i < 0 || i >= rows || j < 0 || j >= cols || grid[i][j] !== "1") {
        return;
    }

    grid[i][j] = "0";

    dfs(grid, i - 1, j, rows, cols);
    dfs(grid, i + 1, j, rows, cols);
    dfs(grid, i, j - 1, rows, cols);
    dfs(grid, i, j + 1, rows, cols);
}
