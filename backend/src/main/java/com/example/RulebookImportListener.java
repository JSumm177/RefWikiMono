package com.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.io.InputStream;
import java.util.ArrayList;

@WebListener
public class RulebookImportListener implements ServletContextListener {
    private static final Logger logger = LoggerFactory.getLogger(RulebookImportListener.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        logger.info("Initializing Rulebook Database...");
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            Long count = session.createQuery("SELECT COUNT(r) FROM Rulebook r", Long.class).uniqueResult();
            if (count == 0) {
                logger.info("Rulebook table is empty. Starting import...");
                importRulebook(session, "nfl", "rules/nfl.json", 2025);
                importRulebook(session, "ncaa", "rules/ncaa.json", 2025);
                importRulebook(session, "nba", "rules/nba.json", 2025);
                importRulebook(session, "mlb", "rules/mlb.json", 2025);
                importRulebook(session, "nhl", "rules/nhl.json", 2025);
                importRulebook(session, "soccer", "rules/soccer.json", 2025);
                logger.info("Import completed successfully.");
            } else {
                logger.info("Rulebook data already present. Skipping import.");
            }
        } catch (Exception e) {
            logger.error("Failed to import rulebooks", e);
        }
    }

    private void importRulebook(Session session, String sportName, String resourcePath, int year) throws Exception {
        InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath);
        if (is == null) {
            logger.warn("Rulebook resource not found: {}", resourcePath);
            return;
        }

        JsonNode root = objectMapper.readTree(is);
        Transaction tx = session.beginTransaction();
        try {
            // Get or Create Sport
            Sport sport = session.createQuery("FROM Sport WHERE name = :name", Sport.class)
                    .setParameter("name", sportName.toUpperCase())
                    .uniqueResult();
            if (sport == null) {
                sport = new Sport(sportName.toUpperCase());
                session.persist(sport);
            }

            Rulebook rulebook = new Rulebook();
            rulebook.setSport(sport);
            rulebook.setYear(year);
            rulebook.setTitle(root.get("title").asText());
            rulebook.setSourceUrl(root.has("source_url") ? root.get("source_url").asText() : null);
            session.persist(rulebook);

            JsonNode rulesNode = root.get("rules");
            if (rulesNode.isArray()) {
                for (JsonNode rNode : rulesNode) {
                    RuleEntity rule = new RuleEntity();
                    rule.setRulebook(rulebook);
                    rule.setRuleNumber(rNode.get("rule_id").asInt());
                    rule.setTitle(rNode.get("title").asText());
                    session.persist(rule);

                    JsonNode sectionsNode = rNode.get("sections");
                    if (sectionsNode.isArray()) {
                        for (JsonNode sNode : sectionsNode) {
                            SectionEntity section = new SectionEntity();
                            section.setRule(rule);
                            section.setSectionNumber(sNode.get("section_id").asInt());
                            section.setTitle(sNode.get("title").asText());
                            session.persist(section);

                            JsonNode articlesNode = sNode.get("articles");
                            if (articlesNode.isArray()) {
                                for (JsonNode aNode : articlesNode) {
                                    ArticleEntity article = new ArticleEntity();
                                    article.setSection(section);
                                    article.setArticleNumber(aNode.get("article_id").asInt());
                                    article.setText(aNode.get("text").asText());
                                    session.persist(article);
                                }
                            }
                        }
                    }
                }
            }
            tx.commit();
            logger.info("Imported {} for {}", rulebook.getTitle(), sportName);
        } catch (Exception e) {
            tx.rollback();
            throw e;
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
