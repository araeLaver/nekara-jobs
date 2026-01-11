import java.util.*;

class Solution {

    // Helper classes defined as per problem description
    static class Pizza {
        public String name;
        public int price_S;
        public int price_M;
        public int price_L;

        public Pizza(String name, int price_S, int price_M, int price_L) {
            this.name = name;
            this.price_S = price_S;
            this.price_M = price_M;
            this.price_L = price_L;
        }
    }

    static class OrderItem {
        public String name;
        public String size;
        public int quantity;

        public OrderItem(String name, String size, int quantity) {
            this.name = name;
            this.size = size;
            this.quantity = quantity;
        }
    }

    public int solution(Pizza[] menu, OrderItem[] order) {
        // Map for quick pizza lookup
        Map<String, Pizza> menuMap = new HashMap<>();
        for (Pizza p : menu) {
            menuMap.put(p.name, p);
        }

        int regularCost = calculateRegularCost(menuMap, order);
        
        int cost1 = applyDiscount1(menuMap, order, regularCost);
        int cost2 = applyDiscount2(menuMap, order, regularCost);
        int cost3 = applyDiscount3(menuMap, order);
        int cost4 = applyDiscount4(menuMap, order, regularCost);

        return Math.min(regularCost, Math.min(Math.min(cost1, cost2), Math.min(cost3, cost4)));
    }

    private int getPrice(Pizza p, String size) {
        if (size.equals("Small") || size.equals("Smal1")) return p.price_S; // Handle potential typo in problem text
        if (size.equals("Medium")) return p.price_M;
        if (size.equals("Large")) return p.price_L;
        return 0;
    }

    private int calculateRegularCost(Map<String, Pizza> menuMap, OrderItem[] order) {
        int total = 0;
        for (OrderItem item : order) {
            Pizza p = menuMap.get(item.name);
            total += getPrice(p, item.size) * item.quantity;
        }
        return total;
    }

    // Discount 1: Buy 3, cheapest one is free
    private int applyDiscount1(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        int totalItems = 0;
        int minPrice = Integer.MAX_VALUE;

        for (OrderItem item : order) {
            totalItems += item.quantity;
            Pizza p = menuMap.get(item.name);
            int price = getPrice(p, item.size);
            if (price < minPrice) {
                minPrice = price;
            }
        }

        if (totalItems >= 3) {
            return regularCost - minPrice;
        }
        return regularCost;
    }

    // Discount 2: Buy 5 of same name for 100
    private int applyDiscount2(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        int bestPrice = regularCost;

        // Group items by pizza name
        Map<String, List<Integer>> pizzaPricesByName = new HashMap<>();

        for (OrderItem item : order) {
            pizzaPricesByName.putIfAbsent(item.name, new ArrayList<>());
            Pizza p = menuMap.get(item.name);
            int price = getPrice(p, item.size);
            for (int i = 0; i < item.quantity; i++) {
                pizzaPricesByName.get(item.name).add(price);
            }
        }

        // Try applying discount for each pizza name
        for (String name : pizzaPricesByName.keySet()) {
            List<Integer> prices = pizzaPricesByName.get(name);
            if (prices.size() >= 5) {
                // Sort descending to remove the most expensive 5
                Collections.sort(prices, Collections.reverseOrder());
                
                int sumOfExpensive5 = 0;
                for (int i = 0; i < 5; i++) {
                    sumOfExpensive5 += prices.get(i);
                }

                // New cost = Regular Cost - (Sum of 5 expensive) + 100
                int currentDiscountedCost = regularCost - sumOfExpensive5 + 100;
                bestPrice = Math.min(bestPrice, currentDiscountedCost);
            }
        }

        return bestPrice;
    }

    // Discount 3: For every Large, get free Small of same name
    private int applyDiscount3(Map<String, Pizza> menuMap, OrderItem[] order) {
        int totalCost = 0;
        Map<String, List<OrderItem>> itemsByName = new HashMap<>();
        for (OrderItem item : order) {
            itemsByName.putIfAbsent(item.name, new ArrayList<>());
            itemsByName.get(item.name).add(item);
        }

        for (String name : itemsByName.keySet()) {
            Pizza p = menuMap.get(name);
            int lCount = 0;
            int sCount = 0;
            
            for (OrderItem item : itemsByName.get(name)) {
                if (item.size.equals("Large")) {
                    lCount += item.quantity;
                    totalCost += p.price_L * item.quantity;
                } else if (item.size.equals("Small") || item.size.equals("Smal1")) {
                    sCount += item.quantity;
                    totalCost += p.price_S * item.quantity;
                } else {
                    totalCost += p.price_M * item.quantity;
                }
            }

            int freeSmalls = Math.min(lCount, sCount);
            totalCost -= freeSmalls * p.price_S;
        }

        return totalCost;
    }

    // Discount 4: Buy 3 Large, pay for 3 Medium
    private int applyDiscount4(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        List<Integer> savings = new ArrayList<>();

        for (OrderItem item : order) {
            if (item.size.equals("Large")) {
                Pizza p = menuMap.get(item.name);
                int saving = p.price_L - p.price_M;
                for (int i = 0; i < item.quantity; i++) {
                    savings.add(saving);
                }
            }
        }

        if (savings.size() >= 3) {
            Collections.sort(savings, Collections.reverseOrder());
            int totalSavings = savings.get(0) + savings.get(1) + savings.get(2);
            return regularCost - totalSavings;
        }

        return regularCost;
    }
}
