class Solution {
    /**
     * Calculates the number of operations to reduce a binary string S to 0.
     * Operations:
     * - If even: divide by 2
     * - If odd: subtract 1
     * 
     * Logic:
     * - Iterate from the last character (LSB) to the first '1' (MSB).
     * - If char is '0': need 1 operation (divide by 2).
     * - If char is '1': need 2 operations (subtract 1, then divide by 2).
     * - Exception: The most significant '1' only needs 1 operation (subtract 1).
     * 
     * @param S Binary string representation of an integer
     * @return Number of operations
     */
    public int solution(String S) {
        int firstOneIndex = S.indexOf('1');
        
        // If the string contains no '1's (i.e., "0", "00"), the value is 0.
        if (firstOneIndex == -1) {
            return 0;
        }

        int operations = 0;
        
        // Iterate from the end of the string up to the first '1'
        for (int i = S.length() - 1; i >= firstOneIndex; i--) {
            if (S.charAt(i) == '1') {
                // Odd number: Subtract 1 (becomes even) + Divide by 2
                // Exception: If it's the very last '1' (MSB), we just subtract 1 to get 0.
                if (i == firstOneIndex) {
                    operations += 1;
                } else {
                    operations += 2;
                }
            } else {
                // Even number (0): Divide by 2
                operations += 1;
            }
        }
        
        return operations;
    }
}
