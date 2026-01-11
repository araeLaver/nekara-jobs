/**
 * Task 1: Minimum Weeks for Visits
 * Given an array of weekdays, calculates the minimum number of weeks required
 * assuming the visits occurred in the given order.
 * A new week starts if the next visit's day is earlier than or the same as the current visit's day.
 */
class Solution {
    public int solution(String[] visits) {
        if (visits == null || visits.length == 0) return 0;

        int weekCount = 1;
        int prevDayValue = getDayValue(visits[0]);

        for (int i = 1; i < visits.length; i++) {
            int currentDayValue = getDayValue(visits[i]);

            // If current day is before or same as previous day, a new week must have started
            if (currentDayValue <= prevDayValue) {
                weekCount++;
            }
            prevDayValue = currentDayValue;
        }

        return weekCount;
    }

    /**
     * Converts weekday string to integer (Mon=0, Tue=1, ..., Sun=6)
     */
    private int getDayValue(String day) {
        if (day == null || day.length() < 3) return 0;
        
        // Using first two characters to distinguish days
        // Mon, Tue, Wed, Thu, Fri, Sat, Sun
        char c1 = day.charAt(0);
        char c2 = day.charAt(1);

        switch (c1) {
            case 'M': return 0; // Mon
            case 'W': return 2; // Wed
            case 'F': return 4; // Fri
            case 'T': 
                return (c2 == 'u') ? 1 : 3; // Tue or Thu
            case 'S':
                return (c2 == 'a') ? 5 : 6; // Sat or Sun
            default: return 0;
        }
    }
}
