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

        assertEquals("{\"email\":\"test@example.com\",\"password\":\"password123\"}", json);
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

    @Test
    public void testDeserializationWithEmptyJson() throws Exception {
        String json = "{}";

        AuthRequest request = objectMapper.readValue(json, AuthRequest.class);

        assertNull(request.email);
        assertNull(request.password);
    }
}
