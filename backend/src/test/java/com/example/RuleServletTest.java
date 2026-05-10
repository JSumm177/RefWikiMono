package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RuleServletTest {

    private RuleServlet ruleServlet;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private StringWriter responseWriter;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeAll
    public static void setupDb() {
        TestDatabaseUtil.startDatabase();
    }

    @BeforeEach
    public void setup() throws IOException {
        MockitoAnnotations.openMocks(this);
        ruleServlet = new RuleServlet();
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        TestDatabaseUtil.clearTables();
        seedData();
    }

    private void seedData() {
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            
            Sport nfl = new Sport("NFL");
            session.persist(nfl);
            
            Rulebook rb = new Rulebook();
            rb.setSport(nfl);
            rb.setYear(2025);
            rb.setTitle("Test Rulebook");
            session.persist(rb);
            
            RuleEntity rule = new RuleEntity();
            rule.setRulebook(rb);
            rule.setRuleNumber(8);
            rule.setTitle("Passing");
            session.persist(rule);
            
            SectionEntity section = new SectionEntity();
            section.setRule(rule);
            section.setSectionNumber(1);
            section.setTitle("Forward Pass");
            session.persist(section);
            
            ArticleEntity article = new ArticleEntity();
            article.setSection(section);
            article.setArticleNumber(1);
            article.setText("A forward pass is legal.");
            session.persist(article);
            
            tx.commit();
        }
    }

    @Test
    public void testGetRuleById() throws Exception {
        Long articleId;
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            articleId = session.createQuery("SELECT a.id FROM ArticleEntity a", Long.class).uniqueResult();
        }

        when(request.getPathInfo()).thenReturn("/" + articleId);
        ruleServlet.doGet(request, response);

        verify(response).setContentType("application/json");
        assertTrue(responseWriter.toString().contains("Forward Pass"));
    }

    @Test
    public void testGetRuleNotFound() throws Exception {
        when(request.getPathInfo()).thenReturn("/999");
        ruleServlet.doGet(request, response);
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    public void testSearchRules() throws Exception {
        when(request.getPathInfo()).thenReturn("/");
        when(request.getParameter("q")).thenReturn("legal");
        when(request.getParameter("sport")).thenReturn("NFL");

        ruleServlet.doGet(request, response);

        verify(response).setContentType("application/json");
        List results = mapper.readValue(responseWriter.toString(), List.class);
        assertFalse(results.isEmpty());
    }
}
