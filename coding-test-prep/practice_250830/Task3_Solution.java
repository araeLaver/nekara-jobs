import java.util.*;

/**
 * Task 3: Dice Rotation
 * Finds the minimum rotations to make all top faces (A) or all bottom faces (B) equal.
 * 
 * Elite Strategy:
 * - A rotation is a swap between A[i] and B[i].
 * - For all dice to have the same value, that value MUST be either A[0] or B[0].
 * - We check these two candidates and for each, calculate the cost to make row A uniform OR row B uniform.
 */
class Solution {

    public int solution(int[] A, int[] B) {
        if (A == null || B == null || A.length == 0 || A.length != B.length) {
            return -1;
        }

        int n = A.length;
        // Result will be the minimum of 4 possible scenarios:
        // 1. All A's become A[0]
        // 2. All B's become A[0]
        // 3. All A's become B[0]
        // 4. All B's become B[0]
        
        int res = minRotations(A[0], A, B);
        
        // If A[0] == B[0], no need to check again as it's the same candidate
        if (res == -1 || A[0] != B[0]) {
            int res2 = minRotations(B[0], A, B);
            if (res == -1) res = res2;
            else if (res2 != -1) res = Math.min(res, res2);
        }

        return res;
    }

    /**
     * Helper to find min rotations to make either 'target' the top row or the bottom row.
     */
    private int minRotations(int target, int[] A, int[] B) {
        int rotA = 0; // Rotations to make row A all 'target'
        int rotB = 0; // Rotations to make row B all 'target'
        
        for (int i = 0; i < A.length; i++) {
            // If neither top nor bottom has the target, this target is impossible
            if (A[i] != target && B[i] != target) {
                return -1;
            }
            
            // To make A uniform: if A[i] isn't target, we must rotate (swap from B)
            if (A[i] != target) {
                rotA++;
            }
            // To make B uniform: if B[i] isn't target, we must rotate (swap from A)
            else if (B[i] != target) {
                rotB++;
            }
        }
        
        return Math.min(rotA, rotB);
    }
}