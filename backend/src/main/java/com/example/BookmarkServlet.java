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

@WebServlet("/api/bookmarks/*")
public class BookmarkServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(BookmarkServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("GET /api/bookmarks request received");
        User user = authenticate(req, resp);
        if (user == null) {
            logger.warn("Authentication failed for fetching bookmarks");
            return;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            List<BookmarkDto> bookmarks = session.createQuery(
                "SELECT new com.example.BookmarkDto(b.sport, b.fullReference, b.articleId) " +
                "FROM Bookmark b WHERE b.user.id = :userId", BookmarkDto.class)
                    .setParameter("userId", user.getId())
                    .list();

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(bookmarks));
            logger.info("Successfully fetched {} bookmarks for user {}", bookmarks.size(), user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to fetch bookmarks", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("POST /api/bookmarks request received");
        User user = authenticate(req, resp);
        if (user == null) {
            logger.warn("Authentication failed for adding bookmark");
            return;
        }

        try {
            BookmarkRequest bookmarkReq;
            try {
                bookmarkReq = objectMapper.readValue(req.getInputStream(), BookmarkRequest.class);
            } catch (Exception e) {
                logger.warn("Invalid bookmark request: malformed JSON body");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().print("{\"error\": \"Invalid request body\"}");
                return;
            }

            if (bookmarkReq == null || bookmarkReq.fullReference == null || bookmarkReq.fullReference.isEmpty()) {
                logger.warn("Invalid bookmark request: empty reference");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            logger.info("Attempting to add bookmark: '{}' for sport: {} for user: {}", 
                bookmarkReq.fullReference, bookmarkReq.sport, user.getEmail());

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction transaction = session.beginTransaction();
                
                String sport = bookmarkReq.sport != null ? bookmarkReq.sport : "NFL";

                // Check if already exists
                Bookmark existing = session.createQuery("FROM Bookmark WHERE user.id = :userId AND sport = :sport AND fullReference = :ref", Bookmark.class)
                        .setParameter("userId", user.getId())
                        .setParameter("sport", sport)
                        .setParameter("ref", bookmarkReq.fullReference)
                        .uniqueResult();
                
                if (existing != null) {
                    logger.info("Bookmark already exists. Returning OK.");
                    resp.setStatus(HttpServletResponse.SC_OK);
                    transaction.commit();
                    return;
                }

                Bookmark bookmark = new Bookmark();
                bookmark.setUser(user);
                bookmark.setSport(sport);
                bookmark.setFullReference(bookmarkReq.fullReference);
                bookmark.setArticleId(bookmarkReq.articleId);

                session.persist(bookmark);
                transaction.commit();
                
                logger.info("Successfully added bookmark: {}", bookmarkReq.fullReference);
                resp.setStatus(HttpServletResponse.SC_CREATED);
            }
        } catch (Exception e) {
            logger.error("Failed to add bookmark", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("DELETE /api/bookmarks request received");
        User user = authenticate(req, resp);
        if (user == null) {
            logger.warn("Authentication failed for deleting bookmark");
            return;
        }

        try {
            BookmarkRequest bookmarkReq = objectMapper.readValue(req.getInputStream(), BookmarkRequest.class);
            if (bookmarkReq == null || bookmarkReq.fullReference == null) {
                logger.warn("Invalid delete request: empty reference");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String sport = bookmarkReq.sport != null ? bookmarkReq.sport : "NFL";
            logger.info("Attempting to delete bookmark: '{}' for sport: {} for user: {}", 
                bookmarkReq.fullReference, sport, user.getEmail());

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction transaction = session.beginTransaction();
                int deletedCount = session.createMutationQuery("DELETE FROM Bookmark WHERE user.id = :userId AND sport = :sport AND fullReference = :ref")
                        .setParameter("userId", user.getId())
                        .setParameter("sport", sport)
                        .setParameter("ref", bookmarkReq.fullReference)
                        .executeUpdate();
                transaction.commit();
                
                logger.info("Successfully deleted {} bookmark(s)", deletedCount);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        } catch (Exception e) {
            logger.error("Failed to delete bookmark", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"error\": \"An internal error occurred\"}");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setStatus(HttpServletResponse.SC_OK);
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
