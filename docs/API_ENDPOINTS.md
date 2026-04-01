# API Endpoints

This document describes the existing API endpoints available in the backend application.

## 1. Data Endpoint

*   **URL:** `/data`
*   **Method:** `GET`
*   **Description:** Fetches a sample item from the database.
*   **Response:**
    *   **Content-Type:** `application/json`
    *   **Success (200 OK):**
        ```json
        {
          "message": "Connected to MySQL!",
          "data": "item_name"
        }
        ```
    *   **Error (500 Internal Server Error):**
        ```json
        {
          "error": "An internal error occurred."
        }
        ```

## 2. Authentication Endpoints

The application uses JSON Web Tokens (JWT) for authentication.

### 2.1. Register

*   **URL:** `/api/auth/register`
*   **Method:** `POST`
*   **Description:** Registers a new user.
*   **Request Body:**
    *   **Content-Type:** `application/json`
    *   ```json
        {
          "email": "user@example.com",
          "password": "securepassword123"
        }
        ```
*   **Response:**
    *   **Content-Type:** `application/json`
    *   **Success (201 Created):**
        ```json
        {
          "message": "User registered successfully"
        }
        ```
    *   **Error (400 Bad Request):** Missing email or password.
        ```json
        {
          "error": "Email and password are required"
        }
        ```
    *   **Error (409 Conflict):** User already exists.
        ```json
        {
          "error": "User already exists"
        }
        ```
    *   **Error (500 Internal Server Error):** Registration failed due to a server error.

### 2.2. Login

*   **URL:** `/api/auth/login`
*   **Method:** `POST`
*   **Description:** Authenticates a user and issues a JWT.
*   **Request Body:**
    *   **Content-Type:** `application/json`
    *   ```json
        {
          "email": "user@example.com",
          "password": "securepassword123"
        }
        ```
*   **Headers:**
    *   `X-Client-Platform`: Optional. If set to `web`, the JWT is returned in an `HttpOnly` cookie. Otherwise, it's returned in the response body.
*   **Response:**
    *   **Content-Type:** `application/json`
    *   **Success (200 OK) - Web Client (`X-Client-Platform: web`):**
        *   Sets an `HttpOnly` cookie named `jwt`.
        ```json
        {
          "message": "Login successful"
        }
        ```
    *   **Success (200 OK) - Non-Web Client:**
        ```json
        {
          "message": "Login successful",
          "token": "eyJhbG..."
        }
        ```
    *   **Error (400 Bad Request):** Missing email or password.
        ```json
        {
          "error": "Email and password are required"
        }
        ```
    *   **Error (401 Unauthorized):** Invalid credentials.
        ```json
        {
          "error": "Invalid credentials"
        }
        ```
    *   **Error (500 Internal Server Error):** Login failed due to a server error.