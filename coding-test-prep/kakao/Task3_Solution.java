import java.util.*;

/**
 * Task 3: Airplane Seat Allocation
 * Calculates the maximum number of 4-person families that can sit together in an N-row airplane.
 * Seat columns: A B C   D E F G   H J K (Col A and K usually ignored in this specific problem variant, 
 * focusing on middle blocks B-E, D-G, F-J).
 * 
 * Improvement:
 * - Optimized data structure using BitMasks per row to avoid heavy String manipulation.
 * - Columns mapped to bits: A=0, B=1, ..., K=9 (roughly).
 * - Target Groups: 
 *   1. B,C,D,E (Cols 1,2,3,4)
 *   2. F,G,H,J (Cols 5,6,7,8)
 *   3. D,E,F,G (Cols 3,4,5,6) - Only if 1 and 2 are not fully taken.
 */
class Solution {
    public int solution(int N, String S) {
        // If no reservations, each row can fit 2 families (BCDE and FGHJ)
        if (S == null || S.isEmpty()) {
            return N * 2;
        }

        // Map row number to a bitmask of reserved seats
        // B=1, C=2, D=3, E=4, F=5, G=6, H=7, J=8
        Map<Integer, Integer> reservedRows = new HashMap<>();
        
        for (String seat : S.split(" ")) {
            if (seat.isEmpty()) continue;
            
            // Parse row and column
            // Format is like "1A", "10B". Last char is column.
            char colChar = seat.charAt(seat.length() - 1);
            int rowNum = Integer.parseInt(seat.substring(0, seat.length() - 1));
            
            int colBit = getColumnBit(colChar);
            if (colBit != -1) {
                reservedRows.put(rowNum, reservedRows.getOrDefault(rowNum, 0) | (1 << colBit));
            }
        }

        int totalFamilies = 0;
        
        // Masks for family groups
        // BCDE: 1,2,3,4
        final int MASK_BCDE = (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4);
        // FGHJ: 5,6,7,8
        final int MASK_FGHJ = (1 << 5) | (1 << 6) | (1 << 7) | (1 << 8);
        // DEFG: 3,4,5,6
        final int MASK_DEFG = (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6);

        for (int i = 1; i <= N; i++) {
            int reservedMask = reservedRows.getOrDefault(i, 0);
            
            boolean canBCDE = (reservedMask & MASK_BCDE) == 0;
            boolean canFGHJ = (reservedMask & MASK_FGHJ) == 0;
            boolean canDEFG = (reservedMask & MASK_DEFG) == 0;

            if (canBCDE && canFGHJ) {
                // Best case: 2 families in this row
                totalFamilies += 2;
            } else if (canBCDE || canFGHJ) {
                // One side is free
                totalFamilies += 1;
            } else if (canDEFG) {
                // Middle is free (and sides were blocked)
                totalFamilies += 1;
            }
        }

        return totalFamilies;
    }

    private int getColumnBit(char c) {
        switch (c) {
            case 'B': return 1;
            case 'C': return 2;
            case 'D': return 3;
            case 'E': return 4;
            case 'F': return 5;
            case 'G': return 6;
            case 'H': return 7;
            case 'J': return 8;
            default: return -1; // A and K or others are not part of family seating logic
        }
    }
}