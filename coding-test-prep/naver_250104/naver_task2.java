import java.util.*;

class Solution {

    // Constants for sizes to avoid magic strings and typos
    private static final String SIZE_SMALL = "Small";
    private static final String SIZE_MEDIUM = "Medium";
    private static final String SIZE_LARGE = "Large";
    // Handling specific typo requirement if present in the problem
    private static final String SIZE_SMALL_TYPO = "Smal1"; 

    static class Pizza {
        public final String name;
        public final int priceS;
        public final int priceM;
        public final int priceL;

        public Pizza(String name, int priceS, int priceM, int priceL) {
            this.name = name;
            this.priceS = priceS;
            this.priceM = priceM;
            this.priceL = priceL;
        }

        public int getPrice(String size) {
            if (SIZE_SMALL.equals(size) || SIZE_SMALL_TYPO.equals(size)) return priceS;
            if (SIZE_MEDIUM.equals(size)) return priceM;
            if (SIZE_LARGE.equals(size)) return priceL;
            throw new IllegalArgumentException("Unknown pizza size: " + size);
        }
    }

    static class OrderItem {
        public final String name;
        public final String size;
        public final int quantity;

        public OrderItem(String name, String size, int quantity) {
            this.name = name;
            this.size = size;
            this.quantity = quantity;
        }
    }

    /**
     * Calculates the minimum cost for the pizza order given multiple discount strategies.
     * Strategies are mutually exclusive for the entire order.
     */
    public int solution(Pizza[] menu, OrderItem[] order) {
        Map<String, Pizza> menuMap = buildMenuMap(menu);
        
        int regularCost = calculateRegularCost(menuMap, order);
        
        // Calculate costs with each discount applied independently
        int minCost = regularCost;
        
        minCost = Math.min(minCost, applyDeal3For2(menuMap, order, regularCost));
        minCost = Math.min(minCost, applyDeal5For100(menuMap, order, regularCost));
        minCost = Math.min(minCost, applyDealLargeFreeSmall(menuMap, order)); // Logic differs significantly, recalculated internally
        minCost = Math.min(minCost, applyDeal3LargePay3Medium(menuMap, order, regularCost));

        return minCost;
    }

    private Map<String, Pizza> buildMenuMap(Pizza[] menu) {
        Map<String, Pizza> map = new HashMap<>();
        for (Pizza p : menu) {
            map.put(p.name, p);
        }
        return map;
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
     * Discount 1: "3 for 2 deal" 
     * (Buy 3 or more total pizzas, get the cheapest one free).
     */
    private int applyDeal3For2(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
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
     * Discount 2: "5 of same pizza type (regardless of size? No, usually same name) for 100".
     * Optimization: To maximize benefit, we pick the 5 most expensive ones of that type.
     */
    private int applyDeal5For100(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        int bestPrice = regularCost;

        // Group prices by pizza name to find sets of 5
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
                prices.sort(Collections.reverseOrder());
                
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
     * Logic: For each pizza type, pairs of (Large, Small) result in the Small being free.
     */
    private int applyDealLargeFreeSmall(Map<String, Pizza> menuMap, OrderItem[] order) {
        int totalCost = 0;
        
        // Group items by name to match Large and Small of the same pizza
        Map<String, List<OrderItem>> itemsByName = new HashMap<>();
        for (OrderItem item : order) {
            itemsByName.putIfAbsent(item.name, new ArrayList<>());
            itemsByName.get(item.name).add(item);
        }

        for (String name : itemsByName.keySet()) {
            Pizza p = menuMap.get(name);
            int largeCount = 0;
            int smallCount = 0;
            
            // First pass: Calculate full price and count sizes for this pizza type
            for (OrderItem item : itemsByName.get(name)) {
                totalCost += p.getPrice(item.size) * item.quantity;
                
                if (SIZE_LARGE.equals(item.size)) {
                    largeCount += item.quantity;
                } else if (SIZE_SMALL.equals(item.size) || SIZE_SMALL_TYPO.equals(item.size)) {
                    smallCount += item.quantity;
                }
            }

            // Deduct price of free small pizzas
            int freeSmalls = Math.min(largeCount, smallCount);
            totalCost -= freeSmalls * p.priceS;
        }

        return totalCost;
    }

    /**
     * Discount 4: "Buy 3 Large, pay for 3 Medium".
     * Logic: Find the 3 Large pizzas with the biggest price difference (L - M) and apply discount.
     */
    private int applyDeal3LargePay3Medium(Map<String, Pizza> menuMap, OrderItem[] order, int regularCost) {
        List<Integer> savings = new ArrayList<>();

        for (OrderItem item : order) {
            if (SIZE_LARGE.equals(item.size)) {
                Pizza p = menuMap.get(item.name);
                int saving = p.priceL - p.priceM;
                // Only consider if it's actually a saving
                if (saving > 0) {
                    for (int i = 0; i < item.quantity; i++) {
                        savings.add(saving);
                    }
                }
            }
        }

        if (savings.size() >= 3) {
            // Sort savings descending to pick the best 3 deals
            savings.sort(Collections.reverseOrder());
            int totalSavings = savings.get(0) + savings.get(1) + savings.get(2);
            return regularCost - totalSavings;
        }

        return regularCost;
    }
}