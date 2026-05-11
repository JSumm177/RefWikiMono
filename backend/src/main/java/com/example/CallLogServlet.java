package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

@WebServlet("/api/calls/*")
public class CallLogServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(CallLogServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        
        if ("/community".equals(pathInfo)) {
            handleGetCommunity(req, resp);
            return;
        }

        if (pathInfo != null && pathInfo.matches("^/\\d+$")) {
            handleGetSingleCall(pathInfo.substring(1), req, resp);
            return;
        }

        User user = authenticate(req, resp);
        if (user == null) return;

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            List<CallLog> calls = session.createQuery("FROM CallLog WHERE user.id = :userId ORDER BY timestamp DESC", CallLog.class)
                    .setParameter("userId", user.getId())
                    .list();

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(calls));
        } catch (Exception e) {
            logger.error("Failed to fetch calls", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    private void handleGetCommunity(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            // Select public calls and calculate average ratings and comment counts
            String hql = "SELECT c, AVG(v.rating), COUNT(DISTINCT v.id), COUNT(DISTINCT com.id) FROM CallLog c " +
                         "LEFT JOIN CallVote v ON v.call.id = c.id " +
                         "LEFT JOIN Comment com ON com.call.id = c.id " +
                         "WHERE c.isPublic = true " +
                         "GROUP BY c.id " +
                         "ORDER BY c.timestamp DESC";
            
            List<Object[]> results = session.createQuery(hql, Object[].class).list();
            List<CommunityCallDto> dtos = new ArrayList<>();
            
            for (Object[] row : results) {
                dtos.add(CommunityCallDto.fromEntity((CallLog)row[0], (Double)row[1], (Long)row[2], (Long)row[3]));
            }

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(dtos));
        } catch (Exception e) {
            logger.error("Failed to fetch community calls", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    private void handleGetSingleCall(String idStr, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Long id = Long.parseLong(idStr);
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                String hql = "SELECT c, AVG(v.rating), COUNT(DISTINCT v.id), COUNT(DISTINCT com.id) FROM CallLog c " +
                             "LEFT JOIN CallVote v ON v.call.id = c.id " +
                             "LEFT JOIN Comment com ON com.call.id = c.id " +
                             "WHERE c.id = :id AND c.isPublic = true " +
                             "GROUP BY c.id";
                
                Object[] result = session.createQuery(hql, Object[].class)
                        .setParameter("id", id)
                        .uniqueResult();
                
                if (result == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                CommunityCallDto dto = CommunityCallDto.fromEntity((CallLog)result[0], (Double)result[1], (Long)result[2], (Long)result[3]);
                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(dto));
            }
        } catch (Exception e) {
            logger.error("Failed to fetch single call", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        
        User user = authenticate(req, resp);
        if (user == null) return;

        if (pathInfo != null && pathInfo.contains("/vote")) {
            handleVote(req, resp, user);
            return;
        }

        try {
            CallLogRequest callReq = objectMapper.readValue(req.getInputStream(), CallLogRequest.class);
            if (callReq.penaltyName == null || callReq.penaltyName.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction transaction = session.beginTransaction();

                CallLog call = new CallLog();
                call.setUser(user);
                call.setSport(callReq.sport != null ? callReq.sport : "NFL");
                call.setTeam(callReq.team);
                call.setPenaltyName(callReq.penaltyName);
                call.setRuleReference(callReq.ruleReference);
                call.setControversyLevel(callReq.controversyLevel != null ? callReq.controversyLevel : 1);
                call.setNotes(callReq.notes);
                call.setPublic(callReq.isPublic);

                session.persist(call);
                transaction.commit();
                
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(call));
            }
        } catch (Exception e) {
            logger.error("Failed to log call", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    private void handleVote(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        try {
            String[] parts = req.getPathInfo().split("/");
            Long callId = Long.parseLong(parts[1]);
            
            // Re-use CallLogRequest for rating just to be efficient
            CallLogRequest voteReq = objectMapper.readValue(req.getInputStream(), CallLogRequest.class);
            
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction tx = session.beginTransaction();
                
                CallLog call = session.get(CallLog.class, callId);
                if (call == null || !call.isPublic()) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                // Check if already voted
                CallVote existing = session.createQuery("FROM CallVote WHERE call.id = :cId AND user.id = :uId", CallVote.class)
                        .setParameter("cId", callId)
                        .setParameter("uId", user.getId())
                        .uniqueResult();
                
                if (existing != null) {
                    existing.setRating(voteReq.controversyLevel);
                } else {
                    CallVote vote = new CallVote();
                    vote.setCall(call);
                    vote.setUser(user);
                    vote.setRating(voteReq.controversyLevel);
                    session.persist(vote);
                }
                
                tx.commit();
                resp.setStatus(HttpServletResponse.SC_OK);
                resp.getWriter().print("{\"message\": \"Vote recorded\"}");
            }
        } catch (Exception e) {
            logger.error("Failed to record vote", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    private User authenticate(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String token = null;
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            Cookie[] cookies = req.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (token == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().print("{\"error\": \"Unauthorized: No token provided\"}");
            return null;
        }

        String email = JwtUtil.validateTokenAndGetSubject(token);
        if (email == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().print("{\"error\": \"Unauthorized: Invalid token\"}");
            return null;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            User user = session.createQuery("FROM User WHERE email = :email", User.class)
                    .setParameter("email", email)
                    .uniqueResult();
            if (user == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().print("{\"error\": \"Unauthorized: User not found\"}");
                return null;
            }
            return user;
        } catch (Exception e) {
            logger.error("Database error during authentication", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return null;
        }
    }
}
