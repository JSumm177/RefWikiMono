package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LeaderboardServletTest {

    private LeaderboardServlet leaderboardServlet;

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
        leaderboardServlet = new LeaderboardServlet();
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        TestDatabaseUtil.clearTables();
        seedData();
    }

    private void seedData() {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            
            User user = new User();
            user.setEmail("voter@example.com");
            user.setPasswordHash("hash");
            session.persist(user);
            
            CallLog call = new CallLog();
            call.setUser(user);
            call.setPenaltyName("Bad Call");
            call.setRuleReference("Rule 1");
            call.setControversyLevel(5);
            call.setPublic(true);
            session.persist(call);
            
            CallVote vote = new CallVote();
            vote.setCall(call);
            vote.setUser(user);
            vote.setRating(5);
            session.persist(vote);
            
            tx.commit();
        }
    }

    @Test
    public void testGetMostControversial() throws Exception {
        when(request.getPathInfo()).thenReturn("/");
        leaderboardServlet.doGet(request, response);

        verify(response).setContentType("application/json");
        List results = mapper.readValue(responseWriter.toString(), List.class);
        assertEquals(1, results.size());
        assertTrue(responseWriter.toString().contains("Bad Call"));
    }
}
