package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AuthResponseTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    public void testSerializationAllFields() throws Exception {
        AuthResponse response = new AuthResponse();
        response.message = "Success";
        response.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
        response.error = null;

        String json = mapper.writeValueAsString(response);
        assertTrue(json.contains("\"message\":\"Success\""));
        assertTrue(json.contains("\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""));
        assertTrue(json.contains("\"error\":null") || !json.contains("\"error\""));
    }

    @Test
    public void testSerializationNullFields() throws Exception {
        AuthResponse response = new AuthResponse();

        String json = mapper.writeValueAsString(response);
        assertTrue(json.contains("\"message\":null") || !json.contains("\"message\""));
        assertTrue(json.contains("\"token\":null") || !json.contains("\"token\""));
        assertTrue(json.contains("\"error\":null") || !json.contains("\"error\""));
    }

    @Test
    public void testDeserializationAllFields() throws Exception {
        String json = "{\"message\":\"Success\",\"token\":\"some_token\",\"error\":null}";
        AuthResponse response = mapper.readValue(json, AuthResponse.class);

        assertEquals("Success", response.message);
        assertEquals("some_token", response.token);
        assertNull(response.error);
    }

    @Test
    public void testDeserializationMissingFields() throws Exception {
        String json = "{\"message\":\"Error\"}";
        AuthResponse response = mapper.readValue(json, AuthResponse.class);

        assertEquals("Error", response.message);
        assertNull(response.token);
        assertNull(response.error);
    }
}
