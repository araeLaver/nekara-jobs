import java.util.*;

/**
 * Task 3: Robust Number Formation
 * Handles special cases like single-row boards and prioritizes forming 4-digit numbers.
 */
class Solution {
    public int solution(int[][] board) {
        if (board == null || board.length == 0 || board[0].length == 0) return 0;

        int rows = board.length;
        int cols = board[0].length;

        // Case 1: Single row board
        if (rows == 1) {
            return handleSingleRow(board[0]);
        }

        // Case 2: Multi-row board - Find the largest possible path
        return findMaxPath(board);
    }

    private int handleSingleRow(int[] row) {
        StringBuilder sb = new StringBuilder();
        // Collect all non-zero digits
        for (int val : row) {
            if (val != 0) sb.append(val);
        }
        
        // If we have more than 4, we take the first 4 (or logic based on problem: usually first 4)
        if (sb.length() > 4) {
            return Integer.parseInt(sb.substring(0, 4));
        } else if (sb.length() > 0) {
            return Integer.parseInt(sb.toString());
        }
        return 0;
    }

    private int findMaxPath(int[][] board) {
        int maxVal = 0;
        int rows = board.length;
        int cols = board[0].length;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (board[i][j] != 0) {
                    maxVal = Math.max(maxVal, getMaxFromPos(board, i, j));
                }
            }
        }
        return maxVal;
    }

    private int getMaxFromPos(int[][] board, int r, int c) {
        // Simple 4-way DFS to find max 4-digit number starting from (r,c)
        return dfs(board, new boolean[board.length][board[0].length], r, c, 1, board[r][c]);
    }

    private int dfs(int[][] board, boolean[][] visited, int r, int c, int depth, int val) {
        if (depth == 4) return val;

        visited[r][c] = true;
        int res = val;

        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];

            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length && 
                !visited[nr][nc] && board[nr][nc] != 0) {
                res = Math.max(res, dfs(board, visited, nr, nc, depth + 1, val * 10 + board[nr][nc]));
            }
        }

        visited[r][c] = false;
        return res;
    }
}
