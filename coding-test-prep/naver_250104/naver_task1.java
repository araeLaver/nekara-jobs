// Task 1 Solution

class Solution {
    /**
     * Calculates the minimum cost for the passenger.
     * 
     * Time Complexity: O(N) - We iterate through the ride history once.
     * Space Complexity: O(1) - We use a constant amount of extra space.
     */
    public int solution(int[] start, int[] dest, int[] limit) {
        if (start == null || dest == null || start.length != dest.length) {
            throw new IllegalArgumentException("Start and destination arrays must be non-null and of equal length.");
        }

        int n = start.length;
        int maxStationVisited = 0;
        int totalCost = 0;

        for (int i = 0; i < n; i++) {
            // Calculate distance between start and destination
            int distance = Math.abs(dest[i] - start[i]);
            
            // Fee calculation: Base fee 1 + (2 * distance)
            int rideCost = 1 + (2 * distance);
            
            // Accumulate total cost
            totalCost += rideCost;

            // Update the maximum station number visited to find the applicable daily limit
            maxStationVisited = Math.max(maxStationVisited, Math.max(start[i], dest[i]));
        }

        // The daily limit is determined by the largest station number visited.
        // Ensure maxStationVisited is within bounds of the limit array (though problem constraints usually guarantee this).
        if (maxStationVisited >= limit.length) {
             // Fallback or handle error if station index exceeds limit array bounds. 
             // For this problem context, we assume valid input per constraints.
             maxStationVisited = limit.length - 1; 
        }

        int dailyLimit = limit[maxStationVisited];

        // The passenger pays the minimum of the calculated total cost and the daily limit.
        return Math.min(totalCost, dailyLimit);
    }
}
