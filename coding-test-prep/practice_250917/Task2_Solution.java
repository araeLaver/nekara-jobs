import java.util.*;

/**
 * Task 2: Maximum 4-digit Number from Board
 * Finds the largest 4-digit number that can be formed by moving to adjacent cells (Up, Down, Left, Right).
 * Cells with value 0 are ignored or act as blockers.
 */
class Solution {
    private int maxNumber = 0;

    public int solution(int[][] board) {
        if (board == null || board.length == 0) return 0;
        
        int rows = board.length;
        int cols = board[0].length;
        maxNumber = 0;

        // Try starting from every cell
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (board[i][j] != 0) {
                    boolean[][] visited = new boolean[rows][cols];
                    dfs(board, visited, i, j, 0, 0);
                }
            }
        }

        return maxNumber;
    }

    private void dfs(int[][] board, boolean[][] visited, int r, int c, int depth, int currentVal) {
        int rows = board.length;
        int cols = board[0].length;

        // Build the number: currentVal * 10 + board[r][c]
        int newVal = currentVal * 10 + board[r][c];
        
        // Base case: formed a 4-digit number
        if (depth == 3) {
            maxNumber = Math.max(maxNumber, newVal);
            return;
        }

        visited[r][c] = true;

        // 4 directions: Up, Down, Left, Right
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && board[nr][nc] != 0) {
                dfs(board, visited, nr, nc, depth + 1, newVal);
            }
        }

        visited[r][c] = false; // Backtrack
    }
}
