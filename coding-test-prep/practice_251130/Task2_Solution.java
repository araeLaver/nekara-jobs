/**
 * Task 2: Maximum Stick Length
 * Given two sticks of length A and B, find the maximum length L 
 * such that we can obtain 4 sticks of length L by cutting A and B.
 */
class Solution {
    public int solution(int A, int B) {
        int left = 1;
        int right = Math.max(A, B);
        int result = 0;

        // Binary search for the maximum possible length
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (mid == 0) break;

            // Number of sticks of length 'mid' we can get from A and B
            // Using long to prevent potential overflow if A, B were extremely large (though int here)
            long totalSticks = (long)(A / mid) + (long)(B / mid);

            if (totalSticks >= 4) {
                // Possible to get at least 4 sticks, try longer length
                result = mid;
                left = mid + 1;
            } else {
                // Not possible, try shorter length
                right = mid - 1;
            }
        }

        return result;
    }
}
