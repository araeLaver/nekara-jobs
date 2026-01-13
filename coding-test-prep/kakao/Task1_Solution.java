import java.util.*;

/**
 * Task 1: Check Sequential Path
 * Determines if there is a path that visits vertices in exact order from 1 to N.
 * 
 * Improvement: 
 * - Replaced heavy adjacency list construction with a lightweight HashSet of edges.
 * - Optimized space complexity.
 */
class Solution {
    public boolean solution(int N, int[] A, int[] B) {
        // Optimization: Quick check based on edge count
        // We need at least N-1 edges to connect 1 to N sequentially
        if (A.length < N - 1) {
            return false;
        }

        // Store edges as unique hash codes or strings. 
        // Since N is int, we can use long shifting for unique edge ID: (min << 32) | max
        Set<Long> edges = new HashSet<>();
        
        for (int i = 0; i < A.length; i++) {
            int u = A[i];
            int v = B[i];
            long edgeId = encodeEdge(u, v);
            edges.add(edgeId);
        }

        // Check for existence of edges (1,2), (2,3), ..., (N-1,N)
        for (int i = 1; i < N; i++) {
            long requiredEdge = encodeEdge(i, i + 1);
            if (!edges.contains(requiredEdge)) {
                return false;
            }
        }

        return true;
    }

    private long encodeEdge(int u, int v) {
        // Ensure smaller index is always first for undirected graph consistency
        int min = Math.min(u, v);
        int max = Math.max(u, v);
        return ((long) min << 32) | (max & 0xFFFFFFFFL);
    }
}