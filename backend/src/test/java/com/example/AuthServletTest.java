package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthServletTest {

    private AuthServlet authServlet;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private StringWriter responseWriter;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeAll
    public static void setupDb() {
        TestDatabaseUtil.startDatabase();
    }

    @BeforeEach
    public void setup() throws IOException {
        MockitoAnnotations.openMocks(this);
        authServlet = new AuthServlet();
        responseWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(responseWriter);
        when(response.getWriter()).thenReturn(printWriter);
    }

    @AfterEach
    public void tearDown() {
        TestDatabaseUtil.clearTables();
    }

    private void mockRequestBody(Object obj) throws IOException {
        String json = mapper.writeValueAsString(obj);
        ByteArrayInputStream is = new ByteArrayInputStream(json.getBytes());
        when(request.getInputStream()).thenReturn(new MockServletInputStream(is));
    }

    @Test
    public void testRegisterSuccess() throws Exception {
        when(request.getPathInfo()).thenReturn("/register");

        AuthRequest authReq = new AuthRequest();
        authReq.email = "test@example.com";
        authReq.password = "password123";
        mockRequestBody(authReq);

        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_CREATED);
        assertTrue(responseWriter.toString().contains("User registered successfully"));
    }

    @Test
    public void testRegisterMissingFields() throws Exception {
        when(request.getPathInfo()).thenReturn("/register");

        AuthRequest authReq = new AuthRequest();
        authReq.email = "test@example.com";
        // missing password
        mockRequestBody(authReq);

        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
        assertTrue(responseWriter.toString().contains("Email and password are required"));
    }

    @Test
    public void testRegisterDuplicateUser() throws Exception {
        when(request.getPathInfo()).thenReturn("/register");

        // First registration
        AuthRequest authReq = new AuthRequest();
        authReq.email = "duplicate@example.com";
        authReq.password = "pass";
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        // Reset response mock to verify second call cleanly
        reset(response);
        StringWriter w2 = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(w2));

        // Second registration
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_CONFLICT);
        assertTrue(w2.toString().contains("User already exists"));
    }

    @Test
    public void testLoginSuccessWeb() throws Exception {
        // First register a user
        when(request.getPathInfo()).thenReturn("/register");
        AuthRequest authReq = new AuthRequest();
        authReq.email = "login@example.com";
        authReq.password = "securepass";
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        reset(response);
        StringWriter w2 = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(w2));

        // Now login as web client
        when(request.getPathInfo()).thenReturn("/login");
        when(request.getHeader("X-Client-Platform")).thenReturn("web");
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_OK);
        assertTrue(w2.toString().contains("Login successful"));

        ArgumentCaptor<String> headerNameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> headerValueCaptor = ArgumentCaptor.forClass(String.class);

        verify(response).addHeader(headerNameCaptor.capture(), headerValueCaptor.capture());

        assertEquals("Set-Cookie", headerNameCaptor.getValue());
        String cookieVal = headerValueCaptor.getValue();
        assertTrue(cookieVal.startsWith("jwt="));
        assertTrue(cookieVal.contains("HttpOnly"));
        assertTrue(cookieVal.contains("Path=/"));
        assertTrue(cookieVal.contains("SameSite=Lax"));
    }

    @Test
    public void testLoginSuccessMobile() throws Exception {
        // Register user
        when(request.getPathInfo()).thenReturn("/register");
        AuthRequest authReq = new AuthRequest();
        authReq.email = "mobile@example.com";
        authReq.password = "securepass";
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        reset(response);
        StringWriter w2 = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(w2));

        // Now login as mobile client
        when(request.getPathInfo()).thenReturn("/login");
        when(request.getHeader("X-Client-Platform")).thenReturn("mobile");
        mockRequestBody(authReq);
        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_OK);
        String responseStr = w2.toString();
        assertTrue(responseStr.contains("Login successful"));
        assertTrue(responseStr.contains("\"token\""));
        // Token should be returned in body, not cookie
        verify(response, never()).addHeader(eq("Set-Cookie"), anyString());
    }

    @Test
    public void testLoginInvalidCredentials() throws Exception {
        when(request.getPathInfo()).thenReturn("/login");

        AuthRequest authReq = new AuthRequest();
        authReq.email = "nonexistent@example.com";
        authReq.password = "wrongpass";
        mockRequestBody(authReq);

        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(responseWriter.toString().contains("Invalid credentials"));
    }

    @Test
    public void testInvalidPath() throws Exception {
        when(request.getPathInfo()).thenReturn("/invalid");

        authServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    // Helper class for mock body
    private static class AuthRequest {
        public String email;
        public String password;
    }
}