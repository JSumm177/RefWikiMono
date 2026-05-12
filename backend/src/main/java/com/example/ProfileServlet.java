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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

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
                Transaction tx = session.beginTransaction();
                profile = new UserProfile();
                profile.setUser(user);
                profile.setDisplayName(user.getEmail().split("@")[0]);
                session.persist(profile);
                tx.commit();
            }

            List<UserHomeTeam> homeTeams = session.createQuery("FROM UserHomeTeam WHERE user.id = :userId", UserHomeTeam.class)
                    .setParameter("userId", user.getId())
                    .list();

            Map<String, String> teamsMap = homeTeams.stream()
                    .collect(Collectors.toMap(uht -> uht.getSport().getName(), UserHomeTeam::getTeamName));

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(ProfileDto.fromEntity(profile, teamsMap)));
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
                if (profileReq.roleType != null) profile.setRoleType(profileReq.roleType);
                if (profileReq.bio != null) profile.setBio(profileReq.bio);
                profile.setUpdatedAt(LocalDateTime.now());
                session.persist(profile);

                // Handle Multiple Home Teams
                if (profileReq.homeTeams != null) {
                    for (Map.Entry<String, String> entry : profileReq.homeTeams.entrySet()) {
                        String sportName = entry.getKey().toUpperCase();
                        String teamName = entry.getValue();

                        Sport sport = session.createQuery("FROM Sport WHERE name = :name", Sport.class)
                                .setParameter("name", sportName)
                                .uniqueResult();
                        
                        if (sport != null) {
                            UserHomeTeam uht = session.createQuery("FROM UserHomeTeam WHERE user.id = :userId AND sport.id = :sportId", UserHomeTeam.class)
                                    .setParameter("userId", user.getId())
                                    .setParameter("sportId", sport.getId())
                                    .uniqueResult();
                            
                            if (uht == null) {
                                uht = new UserHomeTeam();
                                uht.setUser(user);
                                uht.setSport(sport);
                            }
                            uht.setTeamName(teamName);
                            session.persist(uht);
                        }
                    }
                }

                tx.commit();

                // Re-fetch everything to return consistent state
                List<UserHomeTeam> updatedTeams = session.createQuery("FROM UserHomeTeam WHERE user.id = :userId", UserHomeTeam.class)
                        .setParameter("userId", user.getId())
                        .list();
                Map<String, String> teamsMap = updatedTeams.stream()
                        .collect(Collectors.toMap(uht -> uht.getSport().getName(), UserHomeTeam::getTeamName));

                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(ProfileDto.fromEntity(profile, teamsMap)));
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
