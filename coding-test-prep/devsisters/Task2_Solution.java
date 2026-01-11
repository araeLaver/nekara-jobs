import java.util.*;

/**
 * Task 2: Minimize Guild Score Difference
 * Select selectA members from guildA and selectB members from guildB 
 * such that the absolute difference of their sum is minimized.
 */
class Solution {
    public int solution(int[] guildA, int[] guildB, int selectA, int selectB) {
        // Validation: Ensure enough members are available
        if (guildA.length < selectA || guildB.length < selectB) {
            return -1;
        }

        // Generate all possible sums for both guilds
        List<Integer> sumsA = getCombinationSums(guildA, selectA);
        List<Integer> sumsB = getCombinationSums(guildB, selectB);

        if (sumsA.isEmpty() || sumsB.isEmpty()) return -1;

        // Sort one list to enable binary search
        Collections.sort(sumsB);

        int minDifference = Integer.MAX_VALUE;

        // For each sum in A, find the closest sum in B
        for (int valA : sumsA) {
            int closestIdx = binarySearch(sumsB, valA);
            
            // Check the element at closestIdx and closestIdx - 1
            if (closestIdx < sumsB.size()) {
                minDifference = Math.min(minDifference, Math.abs(valA - sumsB.get(closestIdx)));
            }
            if (closestIdx > 0) {
                minDifference = Math.min(minDifference, Math.abs(valA - sumsB.get(closestIdx - 1)));
            }
            
            // Early exit if difference is 0
            if (minDifference == 0) return 0;
        }

        return minDifference;
    }

    private List<Integer> getCombinationSums(int[] arr, int k) {
        List<Integer> result = new ArrayList<>();
        backtrack(arr, k, 0, 0, result);
        return result;
    }

    private void backtrack(int[] arr, int k, int start, int currentSum, List<Integer> result) {
        if (k == 0) {
            result.add(currentSum);
            return;
        }

        for (int i = start; i <= arr.length - k; i++) {
            backtrack(arr, k - 1, i + 1, currentSum + arr[i], result);
        }
    }

    private int binarySearch(List<Integer> list, int target) {
        int left = 0;
        int right = list.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (list.get(mid) < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }
}
