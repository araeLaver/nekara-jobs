/**
 * Task 1: Stamina and Potion Usage Simulation
 * Calculates the minimum number of potions needed to complete all scheduled plays.
 */
class Solution {
    /**
     * @param maxStamina Maximum stamina capacity
     * @param initialStamina Starting stamina
     * @param recovery Time interval required to recover 1 stamina point
     * @param potionAmount Stamina restored per 1 potion
     * @param plays Array of [playTime, staminaNeeded]
     * @return Minimum number of potions used
     */
    public int solution(int maxStamina, int initialStamina, int recovery, 
                        int potionAmount, int[][] plays) {
        int currentStamina = initialStamina;
        int lastTime = 0;
        int potionsUsed = 0;

        for (int[] play : plays) {
            int playTime = play[0];
            int staminaNeeded = play[1];

            // 1. Recover stamina based on time elapsed since last action
            int elapsed = playTime - lastTime;
            if (elapsed > 0) {
                int recoveredPoints = elapsed / recovery;
                currentStamina = Math.min(maxStamina, currentStamina + recoveredPoints);
            }

            // 2. If stamina is insufficient, use potions
            if (currentStamina < staminaNeeded) {
                int deficit = staminaNeeded - currentStamina;
                // Ceiling division: (deficit + potionAmount - 1) / potionAmount
                int neededPotions = (deficit + potionAmount - 1) / potionAmount;
                
                potionsUsed += neededPotions;
                currentStamina = Math.min(maxStamina, currentStamina + (neededPotions * potionAmount));
            }

            // 3. Consume stamina for the play
            currentStamina -= staminaNeeded;
            lastTime = playTime;
        }

        return potionsUsed;
    }
}
