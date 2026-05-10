package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BookmarkServletTest {

    private BookmarkServlet bookmarkServlet;

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
        bookmarkServlet = new BookmarkServlet();
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        TestDatabaseUtil.clearTables();
        seedUser();
    }

    private void seedUser() {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            User user = new User();
            user.setEmail("user@example.com");
            user.setPasswordHash("hash");
            session.persist(user);
            tx.commit();
        }
    }

    private void mockAuth() {
        String token = JwtUtil.generateToken("user@example.com");
        Cookie cookie = new Cookie("jwt", token);
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
    }

    @Test
    public void testAddBookmark() throws Exception {
        mockAuth();
        BookmarkRequest bReq = new BookmarkRequest();
        bReq.sport = "NFL";
        bReq.fullReference = "Rule 8";
        bReq.articleId = 123L;
        
        String json = mapper.writeValueAsString(bReq);
        when(request.getInputStream()).thenReturn(new MockServletInputStream(new ByteArrayInputStream(json.getBytes())));

        bookmarkServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_CREATED);
    }

    @Test
    public void testGetBookmarks() throws Exception {
        mockAuth();
        bookmarkServlet.doGet(request, response);
        verify(response).setContentType("application/json");
        List results = mapper.readValue(responseWriter.toString(), List.class);
        assertEquals(0, results.size());
    }
}
