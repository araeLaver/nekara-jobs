// Task 1 Solution

class Solution {
    public int solution(int[] start, int[] dest, int[] limit) {
        // N is within range [1..30], so we don't need to worry about empty arrays per constraints.
        // But initializing maxStationVisited to 0 is safe as station numbers are >= 0.
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

            // Update the maximum station number visited (checking both start and dest)
            if (start[i] > maxStationVisited) {
                maxStationVisited = start[i];
            }
            if (dest[i] > maxStationVisited) {
                maxStationVisited = dest[i];
            }
        }

        // The daily limit is determined by the largest station number visited.
        // limit array has length K (stations 0 to K-1), and maxStationVisited is within [0, K-1].
        int dailyLimit = limit[maxStationVisited];

        // The passenger cannot be charged more than the limit.
        return Math.min(totalCost, dailyLimit);
    }
}
