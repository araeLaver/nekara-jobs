import java.util.*;

/**
 * Task 3: Airplane Seat Allocation
 * Calculates the maximum number of 4-person families that can sit together in an N-row airplane.
 * Valid groups: (B,C,D,E), (D,E,F,G), (F,G,H,J)
 */
class Solution {
    public int solution(int N, String S) {
        if (S == null || S.isEmpty()) {
            return N * 2; // Each row can take 2 families (BCDE and FGHJ)
        }

        Set<String> reserved = new HashSet<>(Arrays.asList(S.split(" ")));
        int totalFamilies = 0;

        for (int i = 1; i <= N; i++) {
            // Check potential groups for current row i
            boolean canBCDE = !reserved.contains(i + "B") && !reserved.contains(i + "C") &&
                             !reserved.contains(i + "D") && !reserved.contains(i + "E");
                             
            boolean canFGHJ = !reserved.contains(i + "F") && !reserved.contains(i + "G") &&
                             !reserved.contains(i + "H") && !reserved.contains(i + "J");
                             
            boolean canDEFG = !reserved.contains(i + "D") && !reserved.contains(i + "E") &&
                             !reserved.contains(i + "F") && !reserved.contains(i + "G");

            if (canBCDE) {
                totalFamilies++;
            }
            if (canFGHJ) {
                totalFamilies++;
            }
            
            // Middle group is only considered if neither BCDE nor FGHJ was picked for their respective overlaps
            if (!canBCDE && !canFGHJ && canDEFG) {
                totalFamilies++;
            }
        }

        return totalFamilies;
    }
}
