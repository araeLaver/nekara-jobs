import java.util.HashSet;
import java.util.Set;

class Solution {
    /**
     * Finds the minimum MEX (Minimum Excluded positive integer) achievable.
     * 
     * Elite Strategy (O(N)):
     * 1. The minimal MEX is the smallest positive integer k that we can 'avoid' picking.
     * 2. We are forced to pick a number X only if A[i] == X AND B[i] == X for some index i.
     * 3. Therefore, we collect all numbers where A[i] == B[i] into a 'forcedSet'.
     * 4. We then iterate from 1 upwards. The first number NOT in 'forcedSet' is our answer.
     * 
     * Time Complexity: O(N)
     * Space Complexity: O(N)
     */
    public int solution(int[] A, int[] B) {
        if (A == null || B == null || A.length != B.length) {
            return -1;
        }

        Set<Integer> forcedSet = new HashSet<>();

        // One pass to identify unavoidable numbers
        for (int i = 0; i < A.length; i++) {
            if (A[i] == B[i]) {
                forcedSet.add(A[i]);
            }
        }

        // Find the smallest positive integer NOT in the forced set.
        // In the worst case (e.g., forcedSet has 1, 2, ..., N), the loop runs N+1 times.
        int k = 1;
        while (true) {
            if (!forcedSet.contains(k)) {
                return k;
            }
            k++;
        }
    }
}