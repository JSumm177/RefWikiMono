package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.mindrot.jbcrypt.BCrypt;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/auth/*")
public class AuthServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(AuthServlet.class.getName());
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

    private void writeResponse(HttpServletResponse resp, int status, ObjectNode node) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.getWriter().print(objectMapper.writeValueAsString(node));
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ObjectNode responseJson = objectMapper.createObjectNode();

        try {
            AuthRequest authReq = objectMapper.readValue(req.getInputStream(), AuthRequest.class);
            if (authReq == null || authReq.email == null || authReq.password == null) {
                responseJson.put("error", "Email and password are required");
                writeResponse(resp, HttpServletResponse.SC_BAD_REQUEST, responseJson);
                return;
            }

            // Check if user exists
            try (Connection conn = DatabaseConfig.getDataSource().getConnection();
                 PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {
                checkStmt.setString(1, authReq.email);
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next()) {
                        responseJson.put("error", "User already exists");
                        writeResponse(resp, HttpServletResponse.SC_CONFLICT, responseJson);
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

                responseJson.put("message", "User registered successfully");
                writeResponse(resp, HttpServletResponse.SC_CREATED, responseJson);
            }

        } catch (SQLException e) {
            if ("23000".equals(e.getSQLState())) {
                responseJson.put("error", "User already exists");
                writeResponse(resp, HttpServletResponse.SC_CONFLICT, responseJson);
            } else {
                logger.log(Level.SEVERE, "Database error during registration", e);
                responseJson.put("error", "Registration failed due to a database error");
                writeResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, responseJson);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Registration action failed", e);
            responseJson.put("error", "Registration failed");
            writeResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, responseJson);
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ObjectNode responseJson = objectMapper.createObjectNode();

        try {
            AuthRequest authReq = objectMapper.readValue(req.getInputStream(), AuthRequest.class);
            if (authReq == null || authReq.email == null || authReq.password == null) {
                responseJson.put("error", "Email and password are required");
                writeResponse(resp, HttpServletResponse.SC_BAD_REQUEST, responseJson);
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
                                // Manual Set-Cookie to include SameSite attribute (not in javax.servlet.http.Cookie)
                                long maxAge = 24 * 60 * 60;
                                String cookieHeader = String.format("jwt=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", token, maxAge);
                                // Enable Secure if request is secure or in production environment (behind proxy)
                                String xForwardedProto = req.getHeader("X-Forwarded-Proto");
                                if (req.isSecure() || "https".equalsIgnoreCase(xForwardedProto)) {
                                    cookieHeader += "; Secure";
                                }
                                resp.addHeader("Set-Cookie", cookieHeader);
                                responseJson.put("message", "Login successful");
                            } else {
                                // Default to returning token in body for mobile or if not specified
                                responseJson.put("message", "Login successful");
                                responseJson.put("token", token);
                            }

                            writeResponse(resp, HttpServletResponse.SC_OK, responseJson);
                            return;
                        }
                    }
                }
            }

            // If we reach here, invalid credentials
            responseJson.put("error", "Invalid credentials");
            writeResponse(resp, HttpServletResponse.SC_UNAUTHORIZED, responseJson);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Login action failed", e);
            responseJson.put("error", "Login failed");
            writeResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, responseJson);
        }
    }
}
