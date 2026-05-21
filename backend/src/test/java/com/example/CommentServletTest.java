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

public class CommentServletTest {

    private CommentServlet commentServlet;

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
        commentServlet = new CommentServlet();
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        TestDatabaseUtil.clearTables();
        seedUserAndCall();
    }

    private void seedUserAndCall() {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            
            User user = new User();
            user.setEmail("user@example.com");
            user.setPasswordHash("hash");
            session.persist(user);

            CallLog call = new CallLog();
            call.setSport("NFL");
            call.setPenaltyName("Pass Interference");
            call.setRuleReference("Rule 8.3");
            call.setNotes("Pass interference call");
            call.setPublic(true);
            call.setUser(user);
            session.persist(call);

            tx.commit();
        }
    }

    private void mockAuth() {
        String token = JwtUtil.generateToken("user@example.com");
        Cookie cookie = new Cookie("jwt", token);
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
    }

    @Test
    public void testGetCommentsEmpty() throws Exception {
        Long callId = getSeededCallId();
        when(request.getPathInfo()).thenReturn("/" + callId);

        commentServlet.doGet(request, response);

        verify(response).setContentType("application/json");
        List<CommentDto> comments = mapper.readValue(responseWriter.toString(),
                mapper.getTypeFactory().constructCollectionType(List.class, CommentDto.class));
        assertTrue(comments.isEmpty());
    }

    @Test
    public void testGetCommentsMissingPath() throws Exception {
        when(request.getPathInfo()).thenReturn(null);

        commentServlet.doGet(request, response);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    @Test
    public void testAddCommentSuccess() throws Exception {
        mockAuth();
        Long callId = getSeededCallId();
        when(request.getPathInfo()).thenReturn("/" + callId);

        CommentRequest commentReq = new CommentRequest();
        commentReq.text = "This is a great call!";
        String json = mapper.writeValueAsString(commentReq);
        when(request.getInputStream()).thenReturn(new MockServletInputStream(new ByteArrayInputStream(json.getBytes())));

        commentServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_CREATED);
        verify(response).setContentType("application/json");

        CommentDto commentDto = mapper.readValue(responseWriter.toString(), CommentDto.class);
        assertEquals("This is a great call!", commentDto.text);
        assertEquals("FAN", commentDto.userRole);
    }

    @Test
    public void testAddCommentMissingCall() throws Exception {
        mockAuth();
        when(request.getPathInfo()).thenReturn("/99999"); // non-existent call ID

        CommentRequest commentReq = new CommentRequest();
        commentReq.text = "Comment on non-existent call";
        String json = mapper.writeValueAsString(commentReq);
        when(request.getInputStream()).thenReturn(new MockServletInputStream(new ByteArrayInputStream(json.getBytes())));

        commentServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    public void testAddCommentEmptyText() throws Exception {
        mockAuth();
        Long callId = getSeededCallId();
        when(request.getPathInfo()).thenReturn("/" + callId);

        CommentRequest commentReq = new CommentRequest();
        commentReq.text = ""; // empty text
        String json = mapper.writeValueAsString(commentReq);
        when(request.getInputStream()).thenReturn(new MockServletInputStream(new ByteArrayInputStream(json.getBytes())));

        commentServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    @Test
    public void testAddCommentUnauthorized() throws Exception {
        Long callId = getSeededCallId();
        when(request.getPathInfo()).thenReturn("/" + callId);

        CommentRequest commentReq = new CommentRequest();
        commentReq.text = "Unauthorized comment";
        String json = mapper.writeValueAsString(commentReq);
        when(request.getInputStream()).thenReturn(new MockServletInputStream(new ByteArrayInputStream(json.getBytes())));

        commentServlet.doPost(request, response);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    private Long getSeededCallId() {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            return session.createQuery("SELECT c.id FROM CallLog c", Long.class).uniqueResult();
        }
    }
}
