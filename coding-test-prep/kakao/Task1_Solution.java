import java.util.*;

/**
 * Task 1: Check Sequential Path
 * Determines if there is a path that visits vertices in exact order from 1 to N.
 */
class Solution {
    public boolean solution(int N, int[] A, int[] B) {
        // Build adjacency list
        Map<Integer, Set<Integer>> graph = new HashMap<>();
        for (int i = 1; i <= N; i++) {
            graph.put(i, new HashSet<>());
        }

        for (int i = 0; i < A.length; i++) {
            graph.get(A[i]).add(B[i]);
            graph.get(B[i]).add(A[i]);
        }

        // To visit 1 -> 2 -> 3 -> ... -> N,
        // there must be an edge between i and i+1 for all i from 1 to N-1.
        for (int i = 1; i < N; i++) {
            if (!graph.get(i).contains(i + 1)) {
                return false;
            }
        }

        return true;
    }
}
