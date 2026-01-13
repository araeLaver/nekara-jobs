/**
 * Task 2: Reverse Number Printing
 * Prints the digits of N in reverse order, skipping leading zeros of the reversed result.
 * Example: 10200 -> reversed 00201 -> prints 201
 */
class Solution {
    public void solution(int N) {
        if (N == 0) {
            System.out.print(0);
            return;
        }

        StringBuilder sb = new StringBuilder();
        boolean leadingZerosFinished = false;

        // Process digits from right to left (which becomes left to right for the output)
        while (N > 0) {
            int digit = N % 10;
            
            if (digit != 0) {
                leadingZerosFinished = true;
            }

            if (leadingZerosFinished) {
                sb.append(digit);
            }
            
            N /= 10;
        }
        
        // If the number was something like 0 (handled above) or fully processed
        if (sb.length() > 0) {
            System.out.print(sb.toString());
        }
    }
}