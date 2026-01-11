import java.util.*;

/**
 * Task 1: Log Level Parser
 * Parses log strings to identify nested logging levels marked by <[LEVEL]> and <[/LEVEL]> tags.
 * Returns an array of integers representing the unique ID of the level for each log line.
 * Root level is 0.
 */
class Solution {
    public String solution(String[] logs) {
        List<Integer> result = new ArrayList<>();
        Stack<String> levelStack = new Stack<>();
        Map<String, Integer> levelMap = new HashMap<>();
        int nextLevelNum = 1;
        
        for (String log : logs) {
            // Case 1: Start of a new level "<[LEVEL_NAME]>"
            // Note: Must ensure it's not an end tag "<[/...]"
            if (log.startsWith("<[") && !log.startsWith("<[/")) {
                String levelName = log.substring(2, log.length() - 1);
                levelStack.push(levelName);

                // Assign a unique ID if this level name is seen for the first time
                levelMap.putIfAbsent(levelName, nextLevelNum++);
            }
            // Case 2: End of a level "<[/LEVEL_NAME]>"
            else if (log.startsWith("<[/") && log.endsWith("]")) {
                String levelName = log.substring(3, log.length() - 1);

                // Pop from stack until we match the closing level (handling potential malformed nesting gracefully)
                // In a well-formed log, the top of the stack should match 'levelName'.
                if (!levelStack.isEmpty() && levelStack.peek().equals(levelName)) {
                    levelStack.pop();
                } else {
                    // Safety: pop until match
                    while (!levelStack.isEmpty()) {
                        String popped = levelStack.pop();
                        if (popped.equals(levelName)) break;
                    }
                }
            }
            // Case 3: Regular Log Message
            else {
                if (levelStack.isEmpty()) {
                    result.add(0); // Root level
                } else {
                    String currentLevel = levelStack.peek();
                    result.add(levelMap.get(currentLevel));
                }
            }
        }

        // Format output as space-separated string
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(result.get(i));
        }

        return sb.toString();
    }
}
