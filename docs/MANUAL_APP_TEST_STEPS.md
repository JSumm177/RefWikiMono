# Comprehensive Manual Test Guide

This guide outlines the manual testing steps for all core features of the RefWiki application, ensuring functionality across Web and Mobile platforms.

## Prerequisites
- Backend and Database services must be running (`./start-dev.sh`).
- Access to the Web UI (http://localhost:5173) or Mobile simulator.

---

## 1. Authentication & Security

### 1.1 User Registration
1. Navigate to the **Register** page.
2. Enter an email and a password (must be 8+ chars, include a letter, number, and special char).
3. **Expected Result:** Account created, redirected to login, success message displayed.

### 1.2 Secure Login & Logout
1. Log in with registered credentials.
2. **Expected Result:** Redirected to Dashboard. Web uses HttpOnly cookies; Mobile receives a token.
3. Click **Logout**.
4. **Expected Result:** Session cleared, redirected to login page.

---

## 2. Rulebook Engine

### 2.1 Multi-Sport Search
1. Navigate to the **Search** page.
2. Select a sport (e.g., **NBA** or **MLS**).
3. Type a keyword (e.g., "charging" or "offside").
4. **Expected Result:** Results appear as you type (debounced). Database-backed results are displayed with relevance ranking.

### 2.2 Rule Details
1. Click on a search result.
2. **Expected Result:** Full article text is displayed in a clean, readable layout. Metadata (Sport, Rule #) is visible.

---

## 3. Persistent Bookmarks (Stars)

### 3.1 Starring a Rule
1. Find a rule in Search or on the Detail page.
2. Click the **Star (☆)** icon.
3. **Expected Result:** Icon changes to a solid star (★). A "pending" spinner should briefly appear during the API call.

### 3.2 Dashboard Sync
1. Navigate to the **Live Log** (Dashboard).
2. **Expected Result:** The starred rule appears in the "Starred Rules" list.
3. Click the starred rule on the Dashboard.
4. **Expected Result:** Redirected directly to the Rule Detail page using its database ID.

---

## 4. Social & Community Features

### 4.1 Logging a Call
1. Navigate to **Log Call**.
2. Select a Sport and enter a Team (e.g., NFL, Chiefs).
3. Enter a Penalty Name and use the **Rule Reference** dropdown to find the correct rule.
4. Select a **Controversy Level** (1-5).
5. Toggle **"Publish to Community Feed"** to ON.
6. Submit the form.
7. **Expected Result:** "Call logged" alert appears. Redirected to Dashboard.

### 4.2 Community Feed & Voting
1. Navigate to the **Community** tab.
2. Locate the call you just logged.
3. Vote on the call by clicking a number (1-5).
4. **Expected Result:** The average community rating and vote count update immediately. Users are restricted to one vote per call.

### 4.3 Hall of Shame (Leaderboard)
1. Navigate to the **Leaderboard** tab.
2. **Expected Result:** Public calls with high controversy ratings are ranked #1 through #10.
3. **Synchronization Check:** Verify that a high controversy vote in the Community Feed moves that call up the rankings in real-time.

---

## 5. Cross-Platform Consistency
1. Perform an action on **Web** (e.g., Star a rule).
2. Open the **Mobile App** and log in as the same user.
3. **Expected Result:** The same rule is starred on Mobile. Changes made on one platform must reflect on the other immediately.
