package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.stream.Collectors;

@WebServlet("/api/teams/*")
public class TeamServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(TeamServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String sportName = req.getParameter("sport");

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            String hql = "FROM Team t";
            if (sportName != null && !sportName.isEmpty()) {
                hql += " WHERE t.sport.name = :sportName";
            }
            hql += " ORDER BY t.name ASC";

            var query = session.createQuery(hql, Team.class);
            if (sportName != null && !sportName.isEmpty()) {
                query.setParameter("sportName", sportName.toUpperCase());
            }

            List<Team> teams = query.list();
            List<TeamDto> dtos = teams.stream()
                    .map(TeamDto::fromEntity)
                    .collect(Collectors.toList());

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(dtos));
        } catch (Exception e) {
            logger.error("Failed to fetch teams", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
