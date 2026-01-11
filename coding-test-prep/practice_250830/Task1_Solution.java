import java.util.*;

/**
 * Task 1: Log Level Parser
 * Parses log strings to identify nested logging levels marked by <[LEVEL]> and <[/LEVEL]> tags.
 * Returns a space-separated string of level IDs for each log message.
 * 
 * Elite Improvements:
 * - Robust stack management: Ignore mismatched closing tags instead of clearing the stack.
 * - Defensive programming: Added null/empty checks.
 * - Optimization: Uses StringBuilder for result construction.
 */
class Solution {
    public String solution(String[] logs) {
        if (logs == null || logs.length == 0) {
            return "";
        }

        List<Integer> result = new ArrayList<>();
        Deque<String> levelStack = new ArrayDeque<>(); // Use Deque instead of Stack for better performance
        Map<String, Integer> levelMap = new HashMap<>();
        int nextLevelId = 1;
        
        for (String log : logs) {
            if (log == null || log.isEmpty()) continue;

            // Case 1: Start Tag "<[LEVEL_NAME]>"
            if (log.startsWith("<[") && !log.startsWith("<[/") && log.endsWith("]")) {
                String levelName = log.substring(2, log.length() - 1);
                levelStack.push(levelName);
                levelMap.putIfAbsent(levelName, nextLevelId++);
            }
            // Case 2: End Tag "<[/LEVEL_NAME]>"
            else if (log.startsWith("<[/") && log.endsWith("]")) {
                String levelName = log.substring(3, log.length() - 1);
                
                // Only pop if it matches the current top to maintain context integrity
                if (!levelStack.isEmpty() && levelStack.peek().equals(levelName)) {
                    levelStack.pop();
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

        // Format output
        if (result.isEmpty()) return "";
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            sb.append(result.get(i));
            if (i < result.size() - 1) {
                sb.append(" ");
            }
        }

        return sb.toString();
    }
}