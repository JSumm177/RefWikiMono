package com.example;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class AuthResponseTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testAuthResponseSerialization() throws JsonProcessingException {
        AuthResponse response = new AuthResponse();
        response.message = "Login successful";
        response.token = "fake-jwt-token";
        response.error = null;

        String json = objectMapper.writeValueAsString(response);

        // Verify the JSON string
        // The order of keys is not guaranteed, so we'll test deserializing it back
        // or check for string contents
        AuthResponse deserialized = objectMapper.readValue(json, AuthResponse.class);

        assertEquals("Login successful", deserialized.message);
        assertEquals("fake-jwt-token", deserialized.token);
        assertNull(deserialized.error);
    }

    @Test
    public void testAuthResponseDeserialization() throws JsonProcessingException {
        String json = "{\"message\":\"Error occurred\",\"token\":null,\"error\":\"Invalid credentials\"}";

        AuthResponse response = objectMapper.readValue(json, AuthResponse.class);

        assertEquals("Error occurred", response.message);
        assertNull(response.token);
        assertEquals("Invalid credentials", response.error);
    }

    @Test
    public void testAuthResponseDeserializationPartial() throws JsonProcessingException {
        String json = "{\"message\":\"Partial object\"}";

        AuthResponse response = objectMapper.readValue(json, AuthResponse.class);

        assertEquals("Partial object", response.message);
        assertNull(response.token);
        assertNull(response.error);
    }
}
