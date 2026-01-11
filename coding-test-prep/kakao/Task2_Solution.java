/**
 * Task 2: Reverse Number Printing
 * Prints the digits of N in reverse order, skipping leading zeros.
 */
class Solution {
    public void solution(int N) {
        int enable_print = 0; 
        
        // Handle negative numbers if necessary (problem usually assumes positive)
        if (N == 0) {
            System.out.print(0);
            return;
        }

        while (N > 0) {
            int digit = N % 10;
            if (digit != 0) {
                enable_print = 1;
            }
            
            if (enable_print == 1) {
                System.out.print(digit);
            }
            N = N / 10;
        }
    }
}
