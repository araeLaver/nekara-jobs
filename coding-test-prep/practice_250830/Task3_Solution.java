import java.util.*;

/**
 * Task 3: Dice Rotation
 * Given two arrays A and B representing the top and bottom faces of N dice,
 * find the minimum number of rotations needed to make all top faces equal or all bottom faces equal.
 * 
 * A rotation swaps A[i] and B[i].
 * Possible targets are A[0] or B[0] (since the first die must match the target too).
 */
class Solution {

    public int solution(int[] A, int[] B) {
        if (A == null || B == null || A.length == 0 || B.length == 0) {
            return -1;
        }

        if (A.length != B.length) {
            return -1;
        }

        int n = A.length;
        if (n == 1) {
            return 0;
        }

        int minRotations = Integer.MAX_VALUE;

        // Try to match everyone to A[0]
        int rotations = calculateRotations(A, B, A[0]);
        if (rotations != -1) {
            minRotations = Math.min(minRotations, rotations);
        }

        // Try to match everyone to B[0]
        // Only if B[0] is different from A[0], otherwise we already checked it.
        if (A[0] != B[0]) {
            rotations = calculateRotations(A, B, B[0]);
            if (rotations != -1) {
                minRotations = Math.min(minRotations, rotations);
            }
        }

        return minRotations == Integer.MAX_VALUE ? -1 : minRotations;
    }

    /**
     * Calculates minimum rotations to make one row (either A or B) all equal to targetValue.
     * We check both possibilities: making row A all 'targetValue' OR making row B all 'targetValue'.
     * Returns the minimum of these two, or -1 if neither is possible.
     */
    private int calculateRotations(int[] A, int[] B, int targetValue) {
        int rotationsToMakeAUniform = 0;
        int rotationsToMakeBUniform = 0;
        
        boolean possibleA = true;
        boolean possibleB = true;

        for (int i = 0; i < A.length; i++) {
            // Check for Row A uniformity
            if (possibleA) {
                if (A[i] == targetValue) {
                    // Already matches, no rotation needed for A
                } else if (B[i] == targetValue) {
                    // Match found in B, rotation needed for A
                    rotationsToMakeAUniform++;
                } else {
                    // Neither A[i] nor B[i] is targetValue -> Impossible
                    possibleA = false;
                }
            }

            // Check for Row B uniformity
            if (possibleB) {
                if (B[i] == targetValue) {
                    // Already matches, no rotation needed for B
                } else if (A[i] == targetValue) {
                    // Match found in A, rotation needed for B
                    rotationsToMakeBUniform++;
                } else {
                    // Neither -> Impossible
                    possibleB = false;
                }
            }
        }

        if (!possibleA && !possibleB) return -1;
        if (!possibleA) return rotationsToMakeBUniform;
        if (!possibleB) return rotationsToMakeAUniform;
        
        return Math.min(rotationsToMakeAUniform, rotationsToMakeBUniform);
    }
}
