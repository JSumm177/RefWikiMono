package com.example;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    @Test
    public void testGenerateAndValidateToken() {
        // Pom.xml SUREFIRE plugin already injects JWT_SECRET_TEST as property which is set
        String email = "test@example.com";
        String token = JwtUtil.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String subject = JwtUtil.validateTokenAndGetSubject(token);
        assertEquals(email, subject);
    }

    @Test
    public void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        String subject = JwtUtil.validateTokenAndGetSubject(invalidToken);

        assertNull(subject);
    }

    @Test
    public void testValidateMissingToken() {
        assertNull(JwtUtil.validateTokenAndGetSubject(null));
        assertNull(JwtUtil.validateTokenAndGetSubject(""));
        assertNull(JwtUtil.validateTokenAndGetSubject("   "));
    }
}