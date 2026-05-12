package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.time.LocalDateTime;

@WebServlet("/api/profile/*")
public class ProfileServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(ProfileServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = authenticate(req, resp);
        if (user == null) return;

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            UserProfile profile = session.createQuery("FROM UserProfile WHERE user.id = :userId", UserProfile.class)
                    .setParameter("userId", user.getId())
                    .uniqueResult();

            if (profile == null) {
                // Create a default profile if it doesn't exist
                Transaction tx = session.beginTransaction();
                profile = new UserProfile();
                profile.setUser(user);
                profile.setDisplayName(user.getEmail().split("@")[0]);
                session.persist(profile);
                tx.commit();
            }

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(ProfileDto.fromEntity(profile)));
        } catch (Exception e) {
            logger.error("Failed to fetch profile", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = authenticate(req, resp);
        if (user == null) return;

        try {
            ProfileDto profileReq = objectMapper.readValue(req.getInputStream(), ProfileDto.class);
            
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction tx = session.beginTransaction();
                
                UserProfile profile = session.createQuery("FROM UserProfile WHERE user.id = :userId", UserProfile.class)
                        .setParameter("userId", user.getId())
                        .uniqueResult();

                if (profile == null) {
                    profile = new UserProfile();
                    profile.setUser(user);
                }

                if (profileReq.displayName != null) profile.setDisplayName(profileReq.displayName);
                if (profileReq.homeTeam != null) profile.setHomeTeam(profileReq.homeTeam);
                if (profileReq.roleType != null) profile.setRoleType(profileReq.roleType);
                if (profileReq.bio != null) profile.setBio(profileReq.bio);
                profile.setUpdatedAt(LocalDateTime.now());

                session.persist(profile);
                tx.commit();

                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(ProfileDto.fromEntity(profile)));
            }
        } catch (Exception e) {
            logger.error("Failed to update profile", e);
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
