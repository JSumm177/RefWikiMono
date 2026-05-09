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

@WebServlet("/api/calls/*")
public class CallLogServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(CallLogServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("GET /api/calls request received");
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
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("POST /api/calls request received");
        User user = authenticate(req, resp);
        if (user == null) return;

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

                session.persist(call);
                transaction.commit();
                
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(call));
            }
        } catch (Exception e) {
            logger.error("Failed to log call", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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
