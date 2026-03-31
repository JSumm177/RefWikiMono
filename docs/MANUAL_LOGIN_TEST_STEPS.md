# Manual Test Steps for Login Flow

This guide outlines the manual testing steps for the login flow of the RefWiki application, ensuring authentication mechanisms work accurately across our Web and Mobile platforms.

## Prerequisites
- A registered user account (email and password).
- Ensure the Backend and Database services are running.
- Access to the frontend application (e.g., http://localhost:8080) or mobile simulator.

---

## 1. Successful Login

**Description:** Verify a user can log in with a valid email and password.

1. Navigate to the Login Page on the web or mobile app.
2. Enter a valid registered **Email Address**.
3. Enter the correct **Password**.
4. Click or tap the **Log In** button.
5. **Expected Result:**
   - The user is authenticated.
   - The application successfully redirects the user to the main dashboard/home screen.
   - A valid JWT token is stored securely (e.g., in a secure HTTP-Only cookie for Web, or Secure Store for Mobile).

---

## 2. Unsuccessful Login - Incorrect Password

**Description:** Verify a user is denied access when providing an incorrect password.

1. Navigate to the Login Page.
2. Enter a valid registered **Email Address**.
3. Enter an incorrect **Password**.
4. Click or tap the **Log In** button.
5. **Expected Result:**
   - The user is not authenticated.
   - An error message is displayed (e.g., "Invalid email or password").
   - The user remains on the Login Page.

---

## 3. Unsuccessful Login - Unregistered Email

**Description:** Verify a user is denied access when providing an email address that does not exist in the system.

1. Navigate to the Login Page.
2. Enter an **Email Address** that is not registered.
3. Enter any **Password**.
4. Click or tap the **Log In** button.
5. **Expected Result:**
   - The user is not authenticated.
   - An error message is displayed (e.g., "Invalid email or password"). Note: For security reasons, the error should ideally be generic and not explicitly state that the email doesn't exist.
   - The user remains on the Login Page.

---

## 4. Validation Error - Empty Fields

**Description:** Verify the application enforces mandatory fields (email and password) before attempting to authenticate.

1. Navigate to the Login Page.
2. Leave both the **Email Address** and **Password** fields blank.
3. Click or tap the **Log In** button.
4. **Expected Result:**
   - The application should prevent the login attempt from being sent to the server.
   - Validation error messages should be displayed below the respective fields (e.g., "Email is required" and "Password is required").

---

## 5. Validation Error - Invalid Email Format

**Description:** Verify the application enforces standard email formatting.

1. Navigate to the Login Page.
2. Enter a malformed email address (e.g., `invalidemail.com` or `user@domain`).
3. Enter a valid **Password**.
4. Click or tap the **Log In** button (or move focus away from the email field).
5. **Expected Result:**
   - The application should prevent the login attempt.
   - A validation error message should be displayed for the email field (e.g., "Please enter a valid email address").
