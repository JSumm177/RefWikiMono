package com.example;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    @BeforeAll
    public static void setup() {
        JwtUtil.setSecretForTesting("supersecretkey123456789012345678901234567890");
    }

    @Test
    public void testGenerateAndValidateToken() {
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

    @Test
    public void testWeakSecretThrowsException() {
        String originalSecret = "supersecretkey123456789012345678901234567890";
        JwtUtil.setSecretForTesting("too-short");
        
        assertThrows(IllegalStateException.class, () -> {
            JwtUtil.generateToken("test@example.com");
        });
        
        // Restore secret for other tests
        JwtUtil.setSecretForTesting(originalSecret);
    }
}
