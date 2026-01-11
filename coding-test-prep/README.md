# Coding Test Prep Summary

## Overview
This document summarizes the refactoring and analysis of coding test problems from various dates and companies (Naver, Kakao, Devsisters, etc.). All solutions have been optimized for correctness, readability, and performance.

## 1. Naver (250104)
*   **Task 1: Metro Fare Calculation**
    *   **Logic**: `1 + 2 * distance` fare calculation with a daily cap based on the max station ID visited.
    *   **Fix**: Corrected formula and max station tracking.
*   **Task 2: Pizza Discount Optimization**
    *   **Logic**: Choose the best among 4 discount strategies (Buy 3 get 1 free, Buy 5 for 100, etc.).
    *   **Fix**: Optimized "Discount 4" (3 Large -> Medium) using greedy sorting ($O(N \log N)$). Corrected "Discount 2" logic.
*   **Task 3: Spring AOP Logging**
    *   **Logic**: AspectJ implementation for logging method calls, returns, exceptions, and execution time.
    *   **Fix**: Resolved method name discrepancies (`logInvocation` vs `logReturnValue`) and added null-safety checks.

## 2. 250830 Session
*   **Task 1: Log Level Parser**
    *   **Topic**: Stack-based parsing of nested tags (`<[LEVEL]>`).
    *   **Status**: Implemented robust parsing logic.
*   **Task 2: Binary String to Zero**
    *   **Topic**: Bitwise operations (Divide by 2 vs Subtract 1).
    *   **Status**: Fixed incorrect logic to use optimal operations (Even: /2, Odd: -1).
*   **Task 3: Dice Rotation**
    *   **Topic**: Minimum rotations to make a row uniform.
    *   **Status**: Optimized greedy approach ($O(N)$).

## 3. 250904 Session
*   **Task 1: Large Before Small**
    *   **Topic**: String validation (Uppercase must appear before Lowercase).
*   **Task 2: URL Builder**
    *   **Topic**: Builder pattern implementation.
    *   **Fix**: Added `TreeMap` to ensure query parameters are sorted.
*   **Task 3: Minimum MEX**
    *   **Topic**: Find minimum excluded positive integer.
    *   **Status**: Optimized from $O(2^N)$ to heuristic checks.

## 4. 250917 Session
*   **Task 1: Board Game Score**
    *   **Topic**: Simulation of moves with Bonus/Penalty cells.
*   **Task 2: Number Formation**
    *   **Topic**: DFS to form max 4-digit number on board.
*   **Task 3: Robust Path Finding**
    *   **Topic**: Enhanced board traversal strategies.

## 5. 251130 Session
*   **Task 1: Weekly Visits**
    *   **Topic**: Count weeks based on day sequence (Mon -> Sun).
*   **Task 2: Stick Cutting**
    *   **Topic**: Binary Search for max length.
    *   **Status**: Implemented $O(\log L)$ solution.

## 6. Company Specific
*   **Devsisters**:
    *   **Task 1**: Stamina/Potion simulation.
    *   **Task 2**: Guild Combination (Binary Search optimization).
*   **Kakao**:
    *   **Task 1**: Graph sequential path check.
    *   **Task 2**: Reverse number printing.
    *   **Task 3**: Airplane seat allocation (Greedy).

## Recommendations for Naver Cloud Test
1.  **Review Binary Search**: Used frequently (Stick cutting, Guild combinations).
2.  **Practice DFS/BFS**: Board games and pathfinding tasks are common.
3.  **Edge Cases**: Always handle `N=1`, empty inputs, and boundary values.
4.  **Java Standard Library**: Be comfortable with `Collections.sort`, `PriorityQueue`, `Map`, `Set`, and `StringBuilder`.

**Good luck with your Naver Cloud coding test!**
