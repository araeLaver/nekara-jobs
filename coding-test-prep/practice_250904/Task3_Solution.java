import java.util.HashSet;
import java.util.Set;

class Solution {
    /**
     * Finds the minimum MEX (Minimum Excluded positive integer) achievable 
     * by selecting one element from either A[i] or B[i] for each index i.
     * 
     * Optimized Approach:
     * Check integers k = 1, 2, 3... sequentially.
     * If we can construct an array C such that k is NOT present in C, then the minimal MEX is k.
     * 
     * k is unavoidable if and only if there exists an index i such that A[i] == k AND B[i] == k.
     * In that case, C[i] must be k, so k must be in C.
     * 
     * If for all i, (A[i] != k || B[i] != k), then we can always choose the value that is NOT k.
     * So k is avoidable.
     */
    public int solution(int[] A, int[] B) {
        // The answer won't exceed N + 1. But checking up to N+1 is sufficient.
        // Actually, we just need to find the first k that is Avoidable.
        // Wait, MEX definition: Smallest positive integer NOT present.
        // We want to MINIMIZE MEX.
        // This means we want to find the SMALLEST k such that we can force k to be NOT present.
        // Correct logic:
        // We want min(MEX). MEX is k means {1, 2, ..., k-1} ARE present, and k is NOT.
        // But here we want the minimum possible MEX across all combinations.
        // So we want to find the smallest k such that there exists a combination where k is missing.
        // Basically: Can we avoid 1? If yes, minimal MEX is 1.
        // If we cannot avoid 1 (meaning 1 is present in ALL combinations), can we avoid 2?
        // If yes, minimal MEX is 2.
        
        // "Cannot avoid k" means: for some index i, BOTH A[i] and B[i] are k.
        // Wait, NO. 
        // "Avoid k" means we can choose values such that k never appears.
        // Condition to avoid k: For every index i, we can choose a value != k.
        // This is possible if for every i, NOT (A[i] == k && B[i] == k).
        // If A[i] == k and B[i] == k, we are FORCED to pick k.
        
        // So, the logic is simply:
        // Find the first k (starting from 1) that is NOT forced to appear.
        // That k can be excluded from our set, making it the MEX.
        // But wait, for k to be the MEX, 1..(k-1) don't strictly HAVE to be present.
        // MEX definition: "Smallest positive integer NOT present".
        // If 1 is not present, MEX is 1.
        // If 1 is present and 2 is not, MEX is 2.
        // We want to minimize this value.
        // So if we can make 1 missing, min MEX is 1.
        // If we can make 2 missing, min MEX is <= 2. (It could be 1 if 1 is also missing).
        // BUT, the question asks for the "minimum MEX".
        // If we can make 1 missing, the MEX for that combination is 1. Since 1 is the smallest possible positive integer, the answer is 1.
        // If we cannot make 1 missing (1 is forced), then in ALL combinations, 1 is present.
        // Then we look at 2. If we can make 2 missing, then for that combination, 1 is present and 2 is missing. So MEX is 2.
        // So the answer is indeed the first k that is avoidable.

        int maxVal = A.length + 1; // Or check inputs range. Assuming typical codility range.
        // Actually, scanning 1 to ... until we find one.
        
        for (int k = 1; k <= 100001; k++) {
            if (canAvoid(A, B, k)) {
                return k;
            }
        }
        return -1; // Should not reach here
    }

    private boolean canAvoid(int[] A, int[] B, int k) {
        for (int i = 0; i < A.length; i++) {
            if (A[i] == k && B[i] == k) {
                // Forced to pick k at this index
                return false;
            }
        }
        return true;
    }
}
