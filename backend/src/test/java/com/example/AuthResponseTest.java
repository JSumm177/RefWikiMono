package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class AuthResponseTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testSerialization() throws Exception {
        AuthResponse response = new AuthResponse();
        response.message = "Success";
        response.token = "sample.jwt.token";
        response.error = null;

        String json = objectMapper.writeValueAsString(response);

        // Assert json contains the values. We parse it back or use string matching.
        // Or we can parse it to a Map to assert.
        // Simplest is to check substrings, or deserialize to a generic JsonNode.
        var jsonNode = objectMapper.readTree(json);
        assertEquals("Success", jsonNode.get("message").asText());
        assertEquals("sample.jwt.token", jsonNode.get("token").asText());
        org.junit.jupiter.api.Assertions.assertTrue(jsonNode.get("error").isNull(), "error should be a JSON null node");
    }

    @Test
    public void testDeserialization() throws Exception {
        String json = "{\"message\":\"Error occurred\",\"token\":null,\"error\":\"Invalid credentials\"}";

        AuthResponse response = objectMapper.readValue(json, AuthResponse.class);

        assertEquals("Error occurred", response.message);
        assertNull(response.token);
        assertEquals("Invalid credentials", response.error);
    }
}
