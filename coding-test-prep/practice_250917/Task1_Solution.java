/**
 * Task 1: Board Game Score Calculation
 * Moves a piece on a board based on a sequence of directions (U, D, L, R)
 * and calculates the total score. Scores can be modified by cell types (Bonus, Penalty).
 */
class Solution {
    // Cell Type Constants
    private static final int NORMAL = 0;
    private static final int BONUS = 1;   // Double score
    private static final int PENALTY = 2; // Half score (integer division)

    public int solution(int[][] board, int[][] cellTypes, String moves) {
        if (board == null || board.length == 0 || board[0].length == 0) return 0;
        
        int rows = board.length;
        int cols = board[0].length;

        int currentRow = 0;
        int currentCol = 0;
        int totalScore = 0;

        // Add starting cell score
        totalScore += calculateScore(board[currentRow][currentCol], cellTypes[currentRow][currentCol]);

        // Process moves
        for (char move : moves.toCharArray()) {
            int nextRow = currentRow;
            int nextCol = currentCol;

            switch (Character.toUpperCase(move)) {
                case 'U': nextRow--; break;
                case 'D': nextRow++; break;
                case 'L': nextCol--; break;
                case 'R': nextCol++; break;
                default: continue; // Skip invalid moves
            }

            // Boundary check: If move is valid, update position and score
            if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
                currentRow = nextRow;
                currentCol = nextCol;
                totalScore += calculateScore(board[currentRow][currentCol], cellTypes[currentRow][currentCol]);
            }
            // Note: Per typical requirements, invalid moves (out of bounds) are often ignored.
        }

        return totalScore;
    }

    private int calculateScore(int baseScore, int type) {
        switch (type) {
            case BONUS: return baseScore * 2;
            case PENALTY: return baseScore / 2;
            default: return baseScore;
        }
    }
}
