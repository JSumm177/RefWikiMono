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
        JwtUtil.setSecretForTesting("super_secret_key_for_testing_purposes_only_12345");
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
        
        // Add a bookmark first
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            User user = session.createQuery("FROM User WHERE email = 'user@example.com'", User.class).uniqueResult();
            Bookmark b = new Bookmark();
            b.setUser(user);
            b.setSport("NFL");
            b.setFullReference("Rule 1");
            b.setArticleId(10L);
            session.persist(b);
            tx.commit();
        }

        bookmarkServlet.doGet(request, response);
        verify(response).setContentType("application/json");
        
        List<BookmarkDto> results = mapper.readValue(responseWriter.toString(), 
            mapper.getTypeFactory().constructCollectionType(List.class, BookmarkDto.class));
        
        assertEquals(1, results.size());
        assertEquals("NFL", results.get(0).sport);
        assertEquals("Rule 1", results.get(0).fullReference);
        assertEquals(10L, results.get(0).articleId);
    }
}
