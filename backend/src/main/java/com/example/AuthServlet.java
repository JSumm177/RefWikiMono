package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.mindrot.jbcrypt.BCrypt;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(AuthServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if ("/register".equals(pathInfo)) {
            handleRegister(req, resp);
        } else if ("/login".equals(pathInfo)) {
            handleLogin(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private static class AuthRequest {
        public String email;
        public String password;
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        ObjectNode responseJson = objectMapper.createObjectNode();

        try {
            AuthRequest authReq = objectMapper.readValue(req.getInputStream(), AuthRequest.class);
            if (authReq.email == null || authReq.password == null) {
                logger.warn("Registration failed: Missing email or password");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                responseJson.put("error", "Email and password are required");
                resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
                return;
            }

            // Check if user exists
            try (Connection conn = DatabaseConfig.getDataSource().getConnection();
                 PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {
                checkStmt.setString(1, authReq.email);
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next()) {
                        logger.warn("Registration failed: User already exists for email {}", authReq.email);
                        resp.setStatus(HttpServletResponse.SC_CONFLICT);
                        responseJson.put("error", "User already exists");
                        resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
                        return;
                    }
                }

                // Hash password and insert
                String hash = BCrypt.hashpw(authReq.password, BCrypt.gensalt());
                try (PreparedStatement insertStmt = conn.prepareStatement("INSERT INTO users (email, password_hash) VALUES (?, ?)")) {
                    insertStmt.setString(1, authReq.email);
                    insertStmt.setString(2, hash);
                    insertStmt.executeUpdate();
                }

                logger.info("User registered successfully: {}", authReq.email);
                resp.setStatus(HttpServletResponse.SC_CREATED);
                responseJson.put("message", "User registered successfully");
                resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
            }

        } catch (Exception e) {
            logger.error("Registration failed with exception", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseJson.put("error", "Registration failed");
            resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        ObjectNode responseJson = objectMapper.createObjectNode();

        try {
            AuthRequest authReq = objectMapper.readValue(req.getInputStream(), AuthRequest.class);
            if (authReq.email == null || authReq.password == null) {
                logger.warn("Login failed: Missing email or password");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                responseJson.put("error", "Email and password are required");
                resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
                return;
            }

            try (Connection conn = DatabaseConfig.getDataSource().getConnection();
                 PreparedStatement stmt = conn.prepareStatement("SELECT password_hash FROM users WHERE email = ?")) {
                stmt.setString(1, authReq.email);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        String storedHash = rs.getString("password_hash");
                        if (BCrypt.checkpw(authReq.password, storedHash)) {
                            // Password matches, generate JWT
                            String token = JwtUtil.generateToken(authReq.email);

                            // Check platform header
                            String platform = req.getHeader("X-Client-Platform");
                            if ("web".equalsIgnoreCase(platform)) {
                                Cookie cookie = new Cookie("jwt", token);
                                cookie.setHttpOnly(true);
                                cookie.setPath("/");
                                cookie.setMaxAge(24 * 60 * 60); // 24 hours
                                resp.addCookie(cookie);
                                responseJson.put("message", "Login successful");
                            } else {
                                // Default to returning token in body for mobile or if not specified
                                responseJson.put("message", "Login successful");
                                responseJson.put("token", token);
                            }

                            logger.info("Login successful: {}", authReq.email);
                            resp.setStatus(HttpServletResponse.SC_OK);
                            resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
                            return;
                        } else {
                            logger.warn("Login failed: Invalid password for {}", authReq.email);
                        }
                    } else {
                        logger.warn("Login failed: User not found for {}", authReq.email);
                    }
                }
            }

            // If we reach here, invalid credentials
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            responseJson.put("error", "Invalid credentials");
            resp.getWriter().print(objectMapper.writeValueAsString(responseJson));

        } catch (Exception e) {
            logger.error("Login failed with exception", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseJson.put("error", "Login failed");
            resp.getWriter().print(objectMapper.writeValueAsString(responseJson));
        }
    }
}
