package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class AuthRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testSerialization() throws Exception {
        AuthRequest request = new AuthRequest();
        request.email = "test@example.com";
        request.password = "password123";

        String json = objectMapper.writeValueAsString(request);

        // ObjectMapper might serialize fields in any order, though usually declaration order.
        // Let's use readTree to be safe.
        assertEquals("test@example.com", objectMapper.readTree(json).get("email").asText());
        assertEquals("password123", objectMapper.readTree(json).get("password").asText());
    }

    @Test
    public void testDeserialization() throws Exception {
        String json = "{\"email\":\"test@example.com\",\"password\":\"password123\"}";

        AuthRequest request = objectMapper.readValue(json, AuthRequest.class);

        assertEquals("test@example.com", request.email);
        assertEquals("password123", request.password);
    }

    @Test
    public void testDeserializationWithMissingFields() throws Exception {
        String json = "{\"email\":\"test@example.com\"}";

        AuthRequest request = objectMapper.readValue(json, AuthRequest.class);

        assertEquals("test@example.com", request.email);
        assertNull(request.password);
    }
}
