import java.util.*;

class Solution {

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

        public int getPrice(String size) {
            // Handle potential typo "Smal1" from problem description robustly
            if ("Small".equals(size) || "Smal1".equals(size)) return price_S;
            if ("Medium".equals(size)) return price_M;
            if ("Large".equals(size)) return price_L;
            throw new IllegalArgumentException("Unknown pizza size: " + size);
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

    /**
     * Calculates the minimum cost for the pizza order given 4 different discount strategies.
     * We calculate the cost for each strategy independently and return the minimum.
     */
    public int solution(Pizza[] menu, OrderItem[] order) {
        Map<String, Pizza> menuMap = new HashMap<>();
        for (Pizza p : menu) {
            menuMap.put(p.name, p);
        }

        int regularCost = calculateRegularCost(menuMap, order);
        
        // Calculate costs with each discount applied
        int costWithDiscount1 = applyDiscount1(menuMap, order, regularCost);
        int costWithDiscount2 = applyDiscount2(menuMap, order, regularCost);
        int costWithDiscount3 = applyDiscount3(menuMap, order); // Re-calculates total logic internally
        int costWithDiscount4 = applyDiscount4(menuMap, order, regularCost);

        return Math.min(regularCost, 
                Math.min(Math.min(costWithDiscount1, costWithDiscount2), 
                         Math.min(costWithDiscount3, costWithDiscount4)));
    }

    private int calculateRegularCost(Map<String, Pizza> menuMap, OrderItem[] order) {
        int total = 0;
        for (OrderItem item : order) {
            Pizza p = menuMap.get(item.name);
            total += p.getPrice(item.size) * item.quantity;
        }
        return total;
    }

    /**
     * Discount 1: "3 for 2 deal" (Buy 3 or more total pizzas, get the cheapest one free).
     * Strategy: Subtract the price of the single cheapest pizza in the entire order.
     */
    private int applyDiscount1(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        int totalQuantity = 0;
        int minPrice = Integer.MAX_VALUE;

        for (OrderItem item : order) {
            totalQuantity += item.quantity;
            Pizza p = menuMap.get(item.name);
            int price = p.getPrice(item.size);
            if (price < minPrice) {
                minPrice = price;
            }
        }

        if (totalQuantity >= 3) {
            return regularCost - minPrice;
        }
        return regularCost;
    }

    /**
     * Discount 2: "5 of same pizza for 100".
     * Strategy: For every 5 pizzas of the same name, replace their cost with 100.
     * To maximize benefit, we pick the 5 most expensive ones of that type (though usually same type/size has same price, 
     * but different sizes of same type matter).
     */
    private int applyDiscount2(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        int bestPrice = regularCost;

        // Group prices by pizza name
        Map<String, List<Integer>> pricesByName = new HashMap<>();

        for (OrderItem item : order) {
            pricesByName.putIfAbsent(item.name, new ArrayList<>());
            Pizza p = menuMap.get(item.name);
            int price = p.getPrice(item.size);
            for (int i = 0; i < item.quantity; i++) {
                pricesByName.get(item.name).add(price);
            }
        }

        for (List<Integer> prices : pricesByName.values()) {
            if (prices.size() >= 5) {
                // Sort descending to discount the most expensive ones first
                Collections.sort(prices, Collections.reverseOrder());
                
                int sumOfTop5 = 0;
                for (int i = 0; i < 5; i++) {
                    sumOfTop5 += prices.get(i);
                }

                // Apply discount: Remove original cost of these 5, add 100
                int currentDiscountedCost = regularCost - sumOfTop5 + 100;
                bestPrice = Math.min(bestPrice, currentDiscountedCost);
            }
        }

        return bestPrice;
    }

    /**
     * Discount 3: "Buy Large, get Small free".
     * Strategy: For each pizza type, count Large and Small orders. 
     * Free Smalls = min(Large count, Small count).
     */
    private int applyDiscount3(Map<String, Pizza> menuMap, OrderItem[] order) {
        int totalCost = 0;
        
        // Group items by name to process pairs
        Map<String, List<OrderItem>> itemsByName = new HashMap<>();
        for (OrderItem item : order) {
            itemsByName.putIfAbsent(item.name, new ArrayList<>());
            itemsByName.get(item.name).add(item);
        }

        for (String name : itemsByName.keySet()) {
            Pizza p = menuMap.get(name);
            int largeCount = 0;
            int smallCount = 0;
            
            // First pass: Calculate full price and count sizes
            for (OrderItem item : itemsByName.get(name)) {
                totalCost += p.getPrice(item.size) * item.quantity;
                
                if ("Large".equals(item.size)) {
                    largeCount += item.quantity;
                } else if ("Small".equals(item.size) || "Smal1".equals(item.size)) {
                    smallCount += item.quantity;
                }
            }

            // Deduct price of free small pizzas
            int freeSmalls = Math.min(largeCount, smallCount);
            totalCost -= freeSmalls * p.price_S;
        }

        return totalCost;
    }

    /**
     * Discount 4: "Buy 3 Large, pay for 3 Medium".
     * Strategy: Convert 3 Large pizzas to Medium price.
     * To maximize benefit, we convert the Large pizzas with the biggest price difference (L - M).
     */
    private int applyDiscount4(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        List<Integer> savings = new ArrayList<>();

        for (OrderItem item : order) {
            if ("Large".equals(item.size)) {
                Pizza p = menuMap.get(item.name);
                int saving = p.price_L - p.price_M;
                // If saving is positive (L > M), it's a candidate
                if (saving > 0) {
                    for (int i = 0; i < item.quantity; i++) {
                        savings.add(saving);
                    }
                }
            }
        }

        if (savings.size() >= 3) {
            // Sort savings descending to pick the best 3 deals
            Collections.sort(savings, Collections.reverseOrder());
            int totalSavings = savings.get(0) + savings.get(1) + savings.get(2);
            return regularCost - totalSavings;
        }

        return regularCost;
    }
}