class Solution {
    
    // Constants for fare calculation
    private static final int BASE_FARE = 1;
    private static final int FARE_PER_DISTANCE = 2;

    /**
     * Calculates the minimum cost for the passenger by comparing the total pay-per-ride cost
     * against the daily maximum limit determined by the farthest station visited.
     * 
     * Time Complexity: O(N)
     * Space Complexity: O(1)
     */
    public int solution(int[] start, int[] dest, int[] dailyLimits) {
        validateInput(start, dest, dailyLimits);

        int numberOfRides = start.length;
        int maxStationVisited = 0;
        long totalPayPerRideCost = 0; // Use long to prevent overflow during accumulation

        for (int i = 0; i < numberOfRides; i++) {
            int distance = Math.abs(dest[i] - start[i]);
            int rideCost = BASE_FARE + (FARE_PER_DISTANCE * distance);
            
            totalPayPerRideCost += rideCost;

            // Track the furthest station index to determine the daily limit cap
            maxStationVisited = Math.max(maxStationVisited, Math.max(start[i], dest[i]));
        }

        // Determine the applicable daily limit.
        // If the visited station index exceeds the limits array, we clamp to the last available limit.
        // (Assuming standard problem constraints where limits cover the station range or the last limit applies indefinitely)
        int applicableDailyLimit;
        if (maxStationVisited >= dailyLimits.length) {
            applicableDailyLimit = dailyLimits[dailyLimits.length - 1];
        } else {
            applicableDailyLimit = dailyLimits[maxStationVisited];
        }

        // Return the minimum of the two costs (casted back to int as per signature)
        return (int) Math.min(totalPayPerRideCost, applicableDailyLimit);
    }

    private void validateInput(int[] start, int[] dest, int[] dailyLimits) {
        if (start == null || dest == null || dailyLimits == null) {
            throw new IllegalArgumentException("Input arrays cannot be null");
        }
        if (start.length != dest.length) {
            throw new IllegalArgumentException("Start and destination arrays must have the same length");
        }
    }
}