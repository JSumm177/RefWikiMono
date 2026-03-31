package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UserTest {

    @Test
    public void testUserGettersAndSetters() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hash123");

        assertEquals(1L, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("hash123", user.getPasswordHash());
    }

    @Test
    public void testUserConstructor() {
        User user = new User(2L, "user2@example.com", "hash456");

        assertEquals(2L, user.getId());
        assertEquals("user2@example.com", user.getEmail());
        assertEquals("hash456", user.getPasswordHash());
    }
}