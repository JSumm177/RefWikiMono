package com.example;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
    private static String SECRET_KEY_ENV = System.getenv("JWT_SECRET");
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    private static Key getSigningKey() {
        if (SECRET_KEY_ENV == null || SECRET_KEY_ENV.isEmpty()) {
            if (System.getProperty("JWT_SECRET_TEST") != null) {
                SECRET_KEY_ENV = System.getProperty("JWT_SECRET_TEST");
            } else {
                throw new RuntimeException("JWT_SECRET environment variable is not set.");
            }
        }
        return Keys.hmacShaKeyFor(SECRET_KEY_ENV.getBytes(StandardCharsets.UTF_8));
    }

    // Visible for testing
    public static void setSecretForTesting(String secret) {
        SECRET_KEY_ENV = secret;
    }

    public static String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }

    public static String validateTokenAndGetSubject(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
