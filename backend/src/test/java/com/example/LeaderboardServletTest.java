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

    @Test
    public void testGetAccuracyLeaderboard() throws Exception {
        // Seed more data for accuracy
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            
            User u2 = new User();
            u2.setEmail("official@ref.com");
            u2.setPasswordHash("h");
            session.persist(u2);
            
            UserProfile p2 = new UserProfile();
            p2.setUser(u2);
            p2.setRoleType("OFFICIAL");
            p2.setDisplayName("Ref");
            session.persist(p2);

            User u3 = new User();
            u3.setEmail("fan@test.com");
            u3.setPasswordHash("h");
            session.persist(u3);
            
            UserProfile p3 = new UserProfile();
            p3.setUser(u3);
            p3.setRoleType("FAN");
            p3.setDisplayName("Fan");
            session.persist(p3);

            // Fetch the call from seedData or create new
            CallLog call = session.createQuery("FROM CallLog", CallLog.class).uniqueResult();
            
            // Current opinions: Logger(5), Voter1(5)
            // Add Voter2(5) -> Consensus will be 5.0
            CallVote v2 = new CallVote();
            v2.setCall(call);
            v2.setUser(u2);
            v2.setRating(5);
            session.persist(v2);

            // Add Voter3(1) -> Differing opinion.
            // Total opinions: 5, 5, 5, 1 -> Avg = 16/4 = 4.0
            CallVote v3 = new CallVote();
            v3.setCall(call);
            v3.setUser(u3);
            v3.setRating(1);
            session.persist(v3);

            // u2 (Official) has actions: Vote(5) on call(Avg=4). Diff=1. Accuracy = 1 - 1/4 = 0.75 (75%)
            // u3 (Fan) has actions: Vote(1) on call(Avg=4). Diff=3. Accuracy = 1 - 3/4 = 0.25 (25%)
            // u2 needs another action to show on leaderboard (min actions = 2)
            
            CallLog call2 = new CallLog();
            call2.setUser(u2); // u2 logs
            call2.setPenaltyName("Clear PI");
            call2.setControversyLevel(1);
            call2.setPublic(true);
            session.persist(call2);

            // Add votes for call2
            for (User u : List.of(u2, u3)) { // u2 also votes on their own? No, UserActions handles logger separately.
                // Wait, UserActions UNION ALL. If logger votes, they have 2 actions on same call.
                // Consensus for call2: Logger(1) + V1(1) + V2(1) = 1.0
            }
            CallVote cv2_1 = new CallVote();
            cv2_1.setCall(call2);
            cv2_1.setUser(u3);
            cv2_1.setRating(1);
            session.persist(cv2_1);

            CallVote cv2_2 = new CallVote();
            cv2_2.setCall(call2);
            cv2_2.setUser(session.createQuery("FROM User WHERE email='voter@example.com'", User.class).uniqueResult());
            cv2_2.setRating(1);
            session.persist(cv2_2);

            tx.commit();
        }

        when(request.getPathInfo()).thenReturn("/accuracy");
        leaderboardServlet.doGet(request, response);

        verify(response).setContentType("application/json");
        List<UserAccuracyDto> results = mapper.readValue(responseWriter.toString(), 
            mapper.getTypeFactory().constructCollectionType(List.class, UserAccuracyDto.class));
        
        assertFalse(results.isEmpty());
        // Official should be higher than Fan in this seeded case
        assertEquals("OFFICIAL", results.get(0).roleType);
        assertTrue(results.get(0).accuracyRate > 50.0);
    }
}
