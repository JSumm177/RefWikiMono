package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

@WebServlet("/api/leaderboard/*")
public class LeaderboardServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(LeaderboardServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            handleGetMostControversial(req, resp);
        } else if ("/teams".equals(pathInfo)) {
            handleGetTeamLeaderboard(req, resp);
        } else if ("/accuracy".equals(pathInfo)) {
            handleGetAccuracyLeaderboard(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void handleGetAccuracyLeaderboard(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            // Native SQL to calculate consensus and then user accuracy
            // Consensus includes original log rating + votes
            String sql = 
                "WITH Consensus AS (" +
                "  SELECT c.id as call_id, " +
                "         (c.controversy_level + COALESCE(SUM(v.rating), 0)) / (1.0 + COUNT(v.id)) as avg_rating, " +
                "         (1 + COUNT(v.id)) as total_votes " +
                "  FROM calls c " +
                "  LEFT JOIN call_votes v ON v.call_id = c.id " +
                "  WHERE c.is_public = true " +
                "  GROUP BY c.id " +
                "  HAVING (1 + COUNT(v.id)) >= 3" + // Minimum 3 opinions for consensus
                "), " +
                "UserActions AS (" +
                "  /* Logger actions */ " +
                "  SELECT c.user_id, c.id as call_id, c.controversy_level as rating " +
                "  FROM calls c " +
                "  WHERE c.is_public = true " +
                "  UNION ALL " +
                "  /* Voter actions */ " +
                "  SELECT v.user_id, v.call_id, v.rating " +
                "  FROM call_votes v " +
                "  JOIN calls c ON c.id = v.call_id " +
                "  WHERE c.is_public = true " +
                ") " +
                "SELECT p.user_id, " +
                "       COALESCE(p.display_name, u.email) as name, " +
                "       p.role_type, " +
                "       AVG(100.0 * (1.0 - ABS(ua.rating - con.avg_rating) / 4.0)) as accuracy, " +
                "       COUNT(*) as actions " +
                "FROM UserActions ua " +
                "JOIN Consensus con ON con.call_id = ua.call_id " +
                "JOIN users u ON u.id = ua.user_id " +
                "JOIN user_profiles p ON p.user_id = ua.user_id " +
                "GROUP BY p.user_id, name, p.role_type " +
                "HAVING COUNT(*) >= 2 " + // Minimum 2 actions to be on leaderboard
                "ORDER BY accuracy DESC " +
                "LIMIT 20";

            List<Object[]> results = session.createNativeQuery(sql, Object[].class).list();
            List<UserAccuracyDto> dtos = new ArrayList<>();
            for (Object[] row : results) {
                dtos.add(new UserAccuracyDto(
                    ((Number)row[0]).longValue(),
                    (String)row[1],
                    (String)row[2],
                    ((Number)row[3]).doubleValue(),
                    ((Number)row[4]).longValue()
                ));
            }

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(dtos));
        } catch (Exception e) {
            logger.error("Failed to fetch accuracy leaderboard", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"Failed to calculate accuracy\"}");
        }
    }

    private void handleGetMostControversial(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String ruleRef = req.getParameter("ruleRef");
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            // Get public calls with highest average controversy and at least 1 vote
            String hql = "SELECT c, AVG(v.rating), COUNT(DISTINCT v.id), COUNT(DISTINCT com.id), p.roleType FROM CallLog c " +
                         "JOIN CallVote v ON v.call.id = c.id " +
                         "LEFT JOIN Comment com ON com.call.id = c.id " +
                         "LEFT JOIN UserProfile p ON p.user.id = c.user.id " +
                         "WHERE c.isPublic = true ";
            
            if (ruleRef != null && !ruleRef.isEmpty()) {
                hql += "AND c.ruleReference = :ruleRef ";
            }
            
            hql += "GROUP BY c.id " +
                   "HAVING COUNT(DISTINCT v.id) >= 1 " + 
                   "ORDER BY AVG(v.rating) DESC";
            
            var query = session.createQuery(hql, Object[].class).setMaxResults(10);
            if (ruleRef != null && !ruleRef.isEmpty()) {
                query.setParameter("ruleRef", ruleRef);
            }
            
            List<Object[]> results = query.list();
            List<CommunityCallDto> dtos = new ArrayList<>();
            
            for (Object[] row : results) {
                dtos.add(CommunityCallDto.fromEntity((CallLog)row[0], (Double)row[1], (Long)row[2], (Long)row[3], (String)row[4]));
            }

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(dtos));
        } catch (Exception e) {
            logger.error("Failed to fetch leaderboard", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    private void handleGetTeamLeaderboard(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // This would show teams with the highest average controversy against them
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            String sql = "SELECT team, AVG(controversy_level) as avg_c, COUNT(*) as count " +
                         "FROM calls " +
                         "WHERE team IS NOT NULL AND team != '' " +
                         "GROUP BY team " +
                         "ORDER BY avg_c DESC " +
                         "LIMIT 10";
            
            List<Object[]> results = session.createNativeQuery(sql, Object[].class).list();
            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(results));
        } catch (Exception e) {
            logger.error("Failed to fetch team leaderboard", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
