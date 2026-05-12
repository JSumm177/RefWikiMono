package com.example;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CorsFilterTest {

    private CorsFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain chain;

    @BeforeEach
    void setUp() throws ServletException {
        filter = new CorsFilter();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        chain = mock(FilterChain.class);

        FilterConfig filterConfig = mock(FilterConfig.class);
        filter.init(filterConfig);
    }

    @Test
    void testCorsHeadersForDisallowedOrigin() throws IOException, ServletException {
        when(request.getHeader("Origin")).thenReturn("https://evil.com");
        when(request.getMethod()).thenReturn("GET");

        filter.doFilter(request, response, chain);

        verify(response, never()).setHeader(eq("Access-Control-Allow-Origin"), anyString());
        verify(response).setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
        verify(response).setHeader("Access-Control-Allow-Credentials", "true");
        verify(chain).doFilter(request, response);
    }

    @Test
    void testNoOriginHeader() throws IOException, ServletException {
        when(request.getHeader("Origin")).thenReturn(null);
        when(request.getMethod()).thenReturn("GET");

        filter.doFilter(request, response, chain);

        verify(response, never()).setHeader(eq("Access-Control-Allow-Origin"), anyString());
        verify(chain).doFilter(request, response);
    }

    @Test
    void testOptionsRequestReturnsOk() throws IOException, ServletException {
        when(request.getHeader("Origin")).thenReturn("https://evil.com");
        when(request.getMethod()).thenReturn("OPTIONS");

        filter.doFilter(request, response, chain);

        verify(response, never()).setHeader(eq("Access-Control-Allow-Origin"), anyString());
        verify(response).setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
        verify(response).setStatus(HttpServletResponse.SC_OK);
        verify(chain, never()).doFilter(request, response);
    }
}
