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
import java.util.List;
import java.util.stream.Collectors;

@WebServlet("/api/bookmarks/*")
public class BookmarkServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(BookmarkServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("GET /api/bookmarks request received");
        User user = authenticate(req, resp);
        if (user == null) {
            logger.warn("Authentication failed for fetching bookmarks");
            return;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            List<Bookmark> bookmarks = session.createQuery("FROM Bookmark WHERE user.id = :userId", Bookmark.class)
                    .setParameter("userId", user.getId())
                    .list();

            List<String> references = bookmarks.stream()
                    .map(Bookmark::getFullReference)
                    .collect(Collectors.toList());

            resp.setContentType("application/json");
            resp.getWriter().print(objectMapper.writeValueAsString(references));
            logger.info("Successfully fetched {} bookmarks for user {}", references.size(), user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to fetch bookmarks", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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
            BookmarkRequest bookmarkReq = objectMapper.readValue(req.getInputStream(), BookmarkRequest.class);
            if (bookmarkReq == null || bookmarkReq.fullReference == null || bookmarkReq.fullReference.isEmpty()) {
                logger.warn("Invalid bookmark request: empty reference");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            logger.info("Attempting to add bookmark: '{}' for user: {}", bookmarkReq.fullReference, user.getEmail());

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction transaction = session.beginTransaction();
                
                // Check if already exists
                Bookmark existing = session.createQuery("FROM Bookmark WHERE user.id = :userId AND fullReference = :ref", Bookmark.class)
                        .setParameter("userId", user.getId())
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
                bookmark.setFullReference(bookmarkReq.fullReference);

                session.persist(bookmark);
                transaction.commit();
                
                logger.info("Successfully added bookmark: {}", bookmarkReq.fullReference);
                resp.setStatus(HttpServletResponse.SC_CREATED);
            }
        } catch (Exception e) {
            logger.error("Failed to add bookmark", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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

            logger.info("Attempting to delete bookmark: '{}' for user: {}", bookmarkReq.fullReference, user.getEmail());

            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                Transaction transaction = session.beginTransaction();
                int deletedCount = session.createMutationQuery("DELETE FROM Bookmark WHERE user.id = :userId AND fullReference = :ref")
                        .setParameter("userId", user.getId())
                        .setParameter("ref", bookmarkReq.fullReference)
                        .executeUpdate();
                transaction.commit();
                
                logger.info("Successfully deleted {} bookmark(s)", deletedCount);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        } catch (Exception e) {
            logger.error("Failed to delete bookmark", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Handled by CorsFilter, but added for safety
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private User authenticate(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String token = null;

        // Try header first
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Try cookie next (for web)
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
            logger.warn("No authentication token found");
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        String email = JwtUtil.validateTokenAndGetSubject(token);
        if (email == null) {
            logger.warn("Invalid JWT token");
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            User user = session.createQuery("FROM User WHERE email = :email", User.class)
                    .setParameter("email", email)
                    .uniqueResult();
            if (user == null) {
                logger.warn("User not found: {}", email);
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
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
