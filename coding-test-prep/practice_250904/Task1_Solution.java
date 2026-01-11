class Solution {
    /**
     * Counts how many distinct letters satisfy the "Large before Small" condition.
     * Condition: For a specific letter (e.g., 'A'/'a'), both uppercase and lowercase must exist,
     * and the first occurrence of the uppercase letter must be BEFORE the first occurrence of the lowercase letter.
     * 
     * @param S Input string
     * @return Number of letters satisfying the condition, or -1 if invalid input (null or non-alphabetic).
     */
    public int solution(String S) {
        if (S == null) {
            return -1;
        }

        // Check for invalid characters (non-alphabetic)
        for (char c : S.toCharArray()) {
            if (!Character.isLetter(c)) {
                return -1;
            }
        }

        int count = 0;

        // Iterate through 'A' to 'Z'
        for (char upper = 'A'; upper <= 'Z'; upper++) {
            char lower = Character.toLowerCase(upper);

            int firstUpper = S.indexOf(upper);
            int firstLower = S.indexOf(lower);

            // Both must exist
            if (firstUpper != -1 && firstLower != -1) {
                // Large must be before Small
                if (firstUpper < firstLower) {
                    count++;
                }
            }
        }

        return count;
    }
}
