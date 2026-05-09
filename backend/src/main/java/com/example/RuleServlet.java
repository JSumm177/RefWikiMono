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

@WebServlet("/api/rules/*")
public class RuleServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(RuleServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            handleSearch(req, resp);
        } else {
            handleGetRule(pathInfo.substring(1), req, resp);
        }
    }

    private void handleSearch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String query = req.getParameter("q");
        String sport = req.getParameter("sport");

        if (query == null || query.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            String sql = "SELECT a.* FROM articles a " +
                         "JOIN sections s ON a.section_id = s.id " +
                         "JOIN rules r ON s.rule_id = r.id " +
                         "JOIN rulebooks rb ON r.rulebook_id = rb.id " +
                         "JOIN sports sp ON rb.sport_id = sp.id " +
                         "WHERE (MATCH(a.text) AGAINST(:query IN BOOLEAN MODE) OR a.text LIKE :likeQuery) ";

            if (sport != null && !sport.isEmpty()) {
                sql += "AND sp.name = :sport ";
            }

            sql += "LIMIT 20";

            var nativeQuery = session.createNativeQuery(sql, ArticleEntity.class)
                    .setParameter("query", query + "*")
                    .setParameter("likeQuery", "%" + query + "%");
            
            if (sport != null && !sport.isEmpty()) {
                nativeQuery.setParameter("sport", sport.toUpperCase());
            }

            List<ArticleEntity> results = nativeQuery.list();
            List<RuleDto> dtos = results.stream()
                    .map(RuleDto::fromArticle)
                    .collect(Collectors.toList());

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(dtos));
        } catch (Exception e) {
            logger.error("Search failed", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private void handleGetRule(String idStr, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Long id = Long.parseLong(idStr);
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                ArticleEntity article = session.get(ArticleEntity.class, id);
                if (article == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
                resp.setContentType("application/json");
                resp.getWriter().print(objectMapper.writeValueAsString(RuleDto.fromArticle(article)));
            }
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
