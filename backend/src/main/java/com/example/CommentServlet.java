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
import java.util.stream.Collectors;

@WebServlet("/api/comments/*")
public class CommentServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(CommentServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try {
            Long callId = Long.parseLong(pathInfo.substring(1));
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                List<Comment> comments = session.createQuery("FROM Comment WHERE call.id = :callId ORDER BY createdAt ASC", Comment.class)
                        .setParameter("callId", callId)
                        .list();

                List<CommentDto> dtos = comments.stream()
                        .map(CommentDto::fromEntity)
                        .collect(Collectors.toList());

                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(dtos));
            }
        } catch (Exception e) {
            logger.error("Failed to fetch comments", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        User user = authenticate(req, resp);
        if (user == null) return;

        try {
            Long callId = Long.parseLong(pathInfo.substring(1));
            CommentRequest commentReq = objectMapper.readValue(req.getInputStream(), CommentRequest.class);
            
            if (commentReq.text == null || commentReq.text.trim().isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction tx = session.beginTransaction();
                
                CallLog call = session.get(CallLog.class, callId);
                if (call == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                Comment comment = new Comment();
                comment.setCall(call);
                comment.setUser(user);
                comment.setText(commentReq.text);

                session.persist(comment);
                tx.commit();

                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(CommentDto.fromEntity(comment)));
            }
        } catch (Exception e) {
            logger.error("Failed to add comment", e);
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
            return null;
        }

        String email = JwtUtil.validateTokenAndGetSubject(token);
        if (email == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            return session.createQuery("FROM User WHERE email = :email", User.class)
                    .setParameter("email", email)
                    .uniqueResult();
        }
    }
}
