# Mobile Manual Test Guide

This guide outlines the manual testing steps for all core features specifically on the RefWiki mobile application (React Native / Expo).

## Prerequisites
- Backend and Database services must be running (`./start-dev.sh`).
- Access to a mobile simulator (iOS/Android) or physical device.
- Ensure the Metro bundler is active and the host IP is correctly detected.

---

## 1. Authentication & Persistence

### 1.1 Secure Login
1. Launch the app. Enter valid credentials.
2. **Expected Result:** App transitions to the main dashboard. Token is securely stored in `expo-secure-store`.

### 1.2 Session Persistence
1. While logged in, force quit the application.
2. Relaunch the app.
3. **Expected Result:** App should automatically bypass the login screen and land on the Dashboard.

### 1.3 Logout
1. Navigate to **Settings**. Tap **Logout**.
2. **Expected Result:** Session cleared, app returns to the Auth stack (Login screen).

---

## 2. Mobile Rulebook Features

### 2.1 Rule Search & Filtering
1. Tap the **Search** tab.
2. Select a sport from the horizontal slider (e.g., **NBA**, **NHL**).
3. Search for a keyword (e.g., "Balk").
4. **Expected Result:** Fast, database-backed results appear. The list should be scrollable.

### 2.2 Native Rule Details
1. Tap a rule from the search results.
2. **Expected Result:** Full rule text loads. Detail page includes a prominent **Star** button and a consistent "Back" navigation.

---

## 3. Persistent Bookmarks

### 3.1 Mobile Starring
1. Star a rule from the Search results.
2. **Expected Result:** Yellow star icon appears.

### 3.2 Dashboard Navigation
1. Tap the **Home** tab.
2. Locate the starred rule in the top list.
3. Tap the starred rule row.
4. **Expected Result:** Immediate navigation to the rule's Detail screen.

---

## 4. Mobile Community & Voting

### 4.1 Reporting a Call
1. Navigate to the **Log Call** tab.
2. Fill out the penalty details.
3. Enable the **"Publish to Community Feed"** toggle.
4. Tap the submit button.
5. **Expected Result:** Success alert appears. User is navigated back to the Home screen.

### 4.2 Community Participation
1. Navigate to the **Community** tab.
2. Find a public call.
3. Tap a number (1-5) on the controversy scale.
4. **Expected Result:** The average rating on the card updates immediately.

### 4.3 Mobile Hall of Shame
1. Tap the **Leaderboard** tab.
2. **Expected Result:** Top 10 most controversial calls are listed with their community rank (#1, #2, etc.).
