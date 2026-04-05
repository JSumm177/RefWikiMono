# Manual Test Steps for Mobile Login Flow

This guide outlines the manual testing steps for the login flow specifically on the React Native mobile application, ensuring authentication mechanisms and local token storage function correctly.

## Prerequisites
- A registered user account (email and password).
- Ensure the Backend and Database services are running.
- Access to a mobile simulator (iOS/Android) or a physical device running the React Native application.
- The `expo-secure-store` module should be correctly configured to store authentication tokens securely.

---

## 1. Successful Login

**Description:** Verify a user can log in with a valid email and password on the mobile app.

1. Launch the RefWiki mobile application.
2. The initial screen should present the Authentication Stack (e.g., Login Page).
3. Enter a valid registered **Email Address**.
4. Enter the correct **Password**.
5. Tap the **Log In** button.
6. **Expected Result:**
   - The user is authenticated.
   - The application successfully transitions from the Auth Stack to the App Stack, displaying the main dashboard/home screen.
   - A valid JWT token is securely stored using `expo-secure-store` on the device.

---

## 2. Unsuccessful Login - Incorrect Password

**Description:** Verify a user is denied access when providing an incorrect password.

1. Launch the application to the Login Page.
2. Enter a valid registered **Email Address**.
3. Enter an incorrect **Password**.
4. Tap the **Log In** button.
5. **Expected Result:**
   - The user is not authenticated.
   - An error message is displayed (e.g., "Invalid email or password") through a mobile-friendly alert or text component.
   - The user remains on the Login Page within the Auth Stack.

---

## 3. Unsuccessful Login - Unregistered Email

**Description:** Verify a user is denied access when providing an email address that does not exist in the system.

1. Launch the application to the Login Page.
2. Enter an **Email Address** that is not registered.
3. Enter any **Password**.
4. Tap the **Log In** button.
5. **Expected Result:**
   - The user is not authenticated.
   - An error message is displayed (e.g., "Invalid email or password").
   - The user remains on the Login Page.

---

## 4. Validation Error - Empty Fields

**Description:** Verify the application enforces mandatory fields (email and password) before attempting to authenticate over the network.

1. Launch the application to the Login Page.
2. Leave both the **Email Address** and **Password** fields blank.
3. Tap the **Log In** button.
4. **Expected Result:**
   - The application should prevent the login attempt from being sent to the server.
   - Validation error messages should be displayed below the respective text inputs (e.g., "Email is required" and "Password is required").

---

## 5. Validation Error - Invalid Email Format

**Description:** Verify the application enforces standard email formatting.

1. Launch the application to the Login Page.
2. Enter a malformed email address (e.g., `invalidemail.com` or `user@domain`).
3. Enter a valid **Password**.
4. Tap the **Log In** button (or move focus away from the email field).
5. **Expected Result:**
   - The application should prevent the login attempt.
   - A validation error message should be displayed for the email field (e.g., "Please enter a valid email address").

---

## 6. Persistent Login Session

**Description:** Verify that a successfully authenticated user remains logged in after restarting the application.

1. Successfully log in to the application (refer to Step 1).
2. Completely close the application on the simulator or device (force quit).
3. Relaunch the RefWiki mobile application.
4. **Expected Result:**
   - The application should check the `expo-secure-store` for an existing valid token.
   - The application should automatically route to the App Stack (main dashboard/home screen) without requiring the user to re-enter their credentials.

---

## 7. Logout Functionality

**Description:** Verify that a user can successfully log out, which clears the session and returns to the login screen.

1. While logged in, navigate to the settings or profile section of the app.
2. Tap the **Log Out** button.
3. **Expected Result:**
   - The user is logged out.
   - The JWT token is removed from the `expo-secure-store`.
   - The application transitions back from the App Stack to the Auth Stack, displaying the Login Page.
