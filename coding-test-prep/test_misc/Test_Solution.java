import java.util.*;

public class Test_Solution {
    static class Message {
        String user;
        String content;
        long timestamp;

        Message(String user, String content, long timestamp) {
            this.user = user;
            this.content = content;
            this.timestamp = timestamp;
        }

        @Override
        public String toString() {
            return String.format("[%d] %s: %s", timestamp, user, content);
        }
    }

    /**
     * Sorts messages based on criteria:
     * 1. Timestamp (Ascending)
     * 2. User name (Ascending, lexicographical)
     *
     * @param messages List of messages to sort
     * @return Sorted list of messages
     */
    public List<Message> sortMessages(List<Message> messages) {
        messages.sort((a, b) -> {
            // 1st priority: Timestamp
            int timeCompare = Long.compare(a.timestamp, b.timestamp);
            if (timeCompare != 0) {
                return timeCompare;
            }
            // 2nd priority: User name
            return a.user.compareTo(b.user);
        });

        return messages;
    }

    // Test Runner
    public static void main(String[] args) {
        Test_Solution sol = new Test_Solution();
        List<Message> messages = new ArrayList<>();
        messages.add(new Message("Alice", "Hello", 1000));
        messages.add(new Message("Bob", "Hi", 1001));
        messages.add(new Message("Alice", "First?", 999));
        messages.add(new Message("Charlie", "Same time", 1000));

        System.out.println("Before Sorting:");
        messages.forEach(System.out::println);

        sol.sortMessages(messages);

        System.out.println("\nAfter Sorting:");
        messages.forEach(System.out::println);
        
        // Expected:
        // [999] Alice
        // [1000] Alice
        // [1000] Charlie
        // [1001] Bob
    }
}
