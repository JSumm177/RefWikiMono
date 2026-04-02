package com.example;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Connection;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

public class ApiServletTest {

    private ApiServlet apiServlet;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private StringWriter responseWriter;

    @BeforeAll
    public static void setupDb() {
        TestDatabaseUtil.startDatabase();
    }

    @BeforeEach
    public void setup() throws IOException {
        TestDatabaseUtil.clearTables();
        MockitoAnnotations.openMocks(this);
        apiServlet = new ApiServlet();

        responseWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(responseWriter);
        when(response.getWriter()).thenReturn(printWriter);
    }

    @AfterEach
    public void tearDown() {
        TestDatabaseUtil.clearTables();
    }

    @Test
    public void testDoGetWithData() throws ServletException, IOException, Exception {
        // Insert dummy data (Liquibase adds 1 item on init, but we truncate/delete before each test)
        // Insert dummy data
        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("INSERT INTO items (name, description) VALUES ('Test Item', 'Desc')");
        }

        apiServlet.doGet(request, response);

        String jsonResponse = responseWriter.toString();
        assertTrue(jsonResponse.contains("\"message\":\"Connected to MySQL!\""));
        // The API servlet uses SELECT name FROM items LIMIT 1
        // Liquibase initializes one item, but tearDown() calls TestDatabaseUtil.clearTables() which DELETES ALL items.
        // Then this test inserts 'Test Item' so 'Test Item' should be returned.
        assertTrue(jsonResponse.contains("\"data\":\"Test Item\""));
        verify(response).setContentType("application/json");
        verify(response).setCharacterEncoding("UTF-8");
    }

    @Test
    public void testDoGetWithoutData() throws ServletException, IOException {
        // No data inserted (TestDatabaseUtil.clearTables() has cleared them)
        // No data inserted
        apiServlet.doGet(request, response);

        String jsonResponse = responseWriter.toString();
        assertTrue(jsonResponse.contains("\"message\":\"Connected to MySQL!\""));
        assertTrue(jsonResponse.contains("\"data\":\"No data found\""));
    }
}