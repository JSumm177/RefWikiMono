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
            ensureSportsAndTeams(session);

            Long count = session.createQuery("SELECT COUNT(r) FROM Rulebook r", Long.class).uniqueResult();
            if (count == 0) {
                logger.info("Rulebook table is empty. Starting import...");
                importRulebook(session, "nfl", "rules/nfl.json", 2025);
                importRulebook(session, "ncaa", "rules/ncaa.json", 2025);
                importRulebook(session, "nba", "rules/nba.json", 2025);
                importRulebook(session, "mlb", "rules/mlb.json", 2025);
                importRulebook(session, "nhl", "rules/nhl.json", 2025);
                importRulebook(session, "mls", "rules/mls.json", 2025);
                logger.info("Import completed successfully.");
            } else {
                logger.info("Rulebook data already present. Skipping import.");
            }
        } catch (Exception e) {
            logger.error("Failed to import rulebooks", e);
        }
    }

    private void ensureSportsAndTeams(Session session) {
        Transaction tx = session.beginTransaction();
        try {
            String[] sports = {"NFL", "NCAA", "NBA", "MLB", "NHL", "MLS"};
            for (String sportName : sports) {
                Sport sport = session.createQuery("FROM Sport WHERE name = :name", Sport.class)
                        .setParameter("name", sportName)
                        .uniqueResult();
                if (sport == null) {
                    sport = new Sport(sportName);
                    session.persist(sport);
                }
                seedTeamsForSport(session, sport);
            }
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw e;
        }
    }

    private void seedTeamsForSport(Session session, Sport sport) {
        Long count = session.createQuery("SELECT COUNT(t) FROM Team t WHERE t.sport.id = :sId", Long.class)
                .setParameter("sId", sport.getId())
                .uniqueResult();
        
        if (count > 0) return;

        String sportName = sport.getName();
        if ("NFL".equals(sportName)) {
            createTeam(session, sport, "Arizona Cardinals", "ARI");
            createTeam(session, sport, "Atlanta Falcons", "ATL");
            createTeam(session, sport, "Baltimore Ravens", "BAL");
            createTeam(session, sport, "Buffalo Bills", "BUF");
            createTeam(session, sport, "Carolina Panthers", "CAR");
            createTeam(session, sport, "Chicago Bears", "CHI");
            createTeam(session, sport, "Cincinnati Bengals", "CIN");
            createTeam(session, sport, "Cleveland Browns", "CLE");
            createTeam(session, sport, "Dallas Cowboys", "DAL");
            createTeam(session, sport, "Denver Broncos", "DEN");
            createTeam(session, sport, "Detroit Lions", "DET");
            createTeam(session, sport, "Green Bay Packers", "GB");
            createTeam(session, sport, "Houston Texans", "HOU");
            createTeam(session, sport, "Indianapolis Colts", "IND");
            createTeam(session, sport, "Jacksonville Jaguars", "JAX");
            createTeam(session, sport, "Kansas City Chiefs", "KC");
            createTeam(session, sport, "Las Vegas Raiders", "LV");
            createTeam(session, sport, "Los Angeles Chargers", "LAC");
            createTeam(session, sport, "Los Angeles Rams", "LAR");
            createTeam(session, sport, "Miami Dolphins", "MIA");
            createTeam(session, sport, "Minnesota Vikings", "MIN");
            createTeam(session, sport, "New England Patriots", "NE");
            createTeam(session, sport, "New Orleans Saints", "NO");
            createTeam(session, sport, "New York Giants", "NYG");
            createTeam(session, sport, "New York Jets", "NYJ");
            createTeam(session, sport, "Philadelphia Eagles", "PHI");
            createTeam(session, sport, "Pittsburgh Steelers", "PIT");
            createTeam(session, sport, "San Francisco 49ers", "SF");
            createTeam(session, sport, "Seattle Seahawks", "SEA");
            createTeam(session, sport, "Tampa Bay Buccaneers", "TB");
            createTeam(session, sport, "Tennessee Titans", "TEN");
            createTeam(session, sport, "Washington Commanders", "WAS");
        } else if ("NBA".equals(sportName)) {
            createTeam(session, sport, "Boston Celtics", "BOS");
            createTeam(session, sport, "Brooklyn Nets", "BKN");
            createTeam(session, sport, "New York Knicks", "NYK");
            createTeam(session, sport, "Philadelphia 76ers", "PHI");
            createTeam(session, sport, "Toronto Raptors", "TOR");
            createTeam(session, sport, "Golden State Warriors", "GSW");
            createTeam(session, sport, "Los Angeles Lakers", "LAL");
            createTeam(session, sport, "Los Angeles Clippers", "LAC");
            createTeam(session, sport, "Phoenix Suns", "PHX");
            createTeam(session, sport, "Sacramento Kings", "SAC");
        } else if ("MLB".equals(sportName)) {
            createTeam(session, sport, "Arizona Diamondbacks", "ARI");
            createTeam(session, sport, "Atlanta Braves", "ATL");
            createTeam(session, sport, "Baltimore Orioles", "BAL");
            createTeam(session, sport, "Boston Red Sox", "BOS");
            createTeam(session, sport, "Chicago Cubs", "CHC");
            createTeam(session, sport, "Chicago White Sox", "CWS");
            createTeam(session, sport, "Cincinnati Reds", "CIN");
            createTeam(session, sport, "Cleveland Guardians", "CLE");
            createTeam(session, sport, "Colorado Rockies", "COL");
            createTeam(session, sport, "Detroit Tigers", "DET");
            createTeam(session, sport, "Houston Astros", "HOU");
            createTeam(session, sport, "Kansas City Royals", "KC");
            createTeam(session, sport, "Los Angeles Angels", "LAA");
            createTeam(session, sport, "Los Angeles Dodgers", "LAD");
            createTeam(session, sport, "Miami Marlins", "MIA");
            createTeam(session, sport, "Milwaukee Brewers", "MIL");
            createTeam(session, sport, "Minnesota Twins", "MIN");
            createTeam(session, sport, "New York Mets", "NYM");
            createTeam(session, sport, "New York Yankees", "NYY");
            createTeam(session, sport, "Oakland Athletics", "OAK");
            createTeam(session, sport, "Philadelphia Phillies", "PHI");
            createTeam(session, sport, "Pittsburgh Pirates", "PIT");
            createTeam(session, sport, "San Diego Padres", "SD");
            createTeam(session, sport, "San Francisco Giants", "SF");
            createTeam(session, sport, "Seattle Mariners", "SEA");
            createTeam(session, sport, "St. Louis Cardinals", "STL");
            createTeam(session, sport, "Tampa Bay Rays", "TB");
            createTeam(session, sport, "Texas Rangers", "TEX");
            createTeam(session, sport, "Toronto Blue Jays", "TOR");
            createTeam(session, sport, "Washington Nationals", "WSH");
        } else if ("MLS".equals(sportName)) {
            createTeam(session, sport, "Atlanta United FC", "ATL");
            createTeam(session, sport, "Austin FC", "ATX");
            createTeam(session, sport, "Charlotte FC", "CLT");
            createTeam(session, sport, "Chicago Fire FC", "CHI");
            createTeam(session, sport, "FC Cincinnati", "CIN");
            createTeam(session, sport, "Colorado Rapids", "COL");
            createTeam(session, sport, "Columbus Crew", "CLB");
            createTeam(session, sport, "D.C. United", "DC");
            createTeam(session, sport, "FC Dallas", "DAL");
            createTeam(session, sport, "Houston Dynamo FC", "HOU");
            createTeam(session, sport, "Sporting Kansas City", "SKC");
            createTeam(session, sport, "LA Galaxy", "LA");
            createTeam(session, sport, "Los Angeles FC", "LAFC");
            createTeam(session, sport, "Inter Miami CF", "MIA");
            createTeam(session, sport, "Minnesota United FC", "MIN");
            createTeam(session, sport, "CF Montréal", "MTL");
            createTeam(session, sport, "Nashville SC", "NSH");
            createTeam(session, sport, "New England Revolution", "NE");
            createTeam(session, sport, "New York Red Bulls", "NY");
            createTeam(session, sport, "New York City FC", "NYC");
            createTeam(session, sport, "Orlando City SC", "ORL");
            createTeam(session, sport, "Philadelphia Union", "PHI");
            createTeam(session, sport, "Portland Timbers", "POR");
            createTeam(session, sport, "Real Salt Lake", "RSL");
            createTeam(session, sport, "San Jose Earthquakes", "SJ");
            createTeam(session, sport, "Seattle Sounders FC", "SEA");
            createTeam(session, sport, "St. Louis City SC", "STL");
            createTeam(session, sport, "Toronto FC", "TOR");
            createTeam(session, sport, "Vancouver Whitecaps FC", "VAN");
        } else if ("NHL".equals(sportName)) {
            createTeam(session, sport, "Anaheim Ducks", "ANA");
            createTeam(session, sport, "Boston Bruins", "BOS");
            createTeam(session, sport, "Buffalo Sabres", "BUF");
            createTeam(session, sport, "Calgary Flames", "CGY");
            createTeam(session, sport, "Carolina Hurricanes", "CAR");
            createTeam(session, sport, "Chicago Blackhawks", "CHI");
            createTeam(session, sport, "Colorado Avalanche", "COL");
            createTeam(session, sport, "Columbus Blue Jackets", "CBJ");
            createTeam(session, sport, "Dallas Stars", "DAL");
            createTeam(session, sport, "Detroit Red Wings", "DET");
            createTeam(session, sport, "Edmonton Oilers", "EDM");
            createTeam(session, sport, "Florida Panthers", "FLA");
            createTeam(session, sport, "Los Angeles Kings", "LAK");
            createTeam(session, sport, "Minnesota Wild", "MIN");
            createTeam(session, sport, "Montreal Canadiens", "MTL");
            createTeam(session, sport, "Nashville Predators", "NSH");
            createTeam(session, sport, "New Jersey Devils", "NJD");
            createTeam(session, sport, "New York Islanders", "NYI");
            createTeam(session, sport, "New York Rangers", "NYR");
            createTeam(session, sport, "Ottawa Senators", "OTT");
            createTeam(session, sport, "Philadelphia Flyers", "PHI");
            createTeam(session, sport, "Pittsburgh Penguins", "PIT");
            createTeam(session, sport, "San Jose Sharks", "SJS");
            createTeam(session, sport, "Seattle Kraken", "SEA");
            createTeam(session, sport, "St. Louis Blues", "STL");
            createTeam(session, sport, "Tampa Bay Lightning", "TBL");
            createTeam(session, sport, "Toronto Maple Leafs", "TOR");
            createTeam(session, sport, "Utah Hockey Club", "UTA");
            createTeam(session, sport, "Vancouver Canucks", "VAN");
            createTeam(session, sport, "Vegas Golden Knights", "VGK");
            createTeam(session, sport, "Washington Capitals", "WSH");
            createTeam(session, sport, "Winnipeg Jets", "WPG");
        }
    }

    private void createTeam(Session session, Sport sport, String name, String abbr) {
        Team team = new Team();
        team.setSport(sport);
        team.setName(name);
        team.setAbbreviation(abbr);
        session.persist(team);
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
    public void contextDestroyed(ServletContextEvent sce) {
        DatabaseConfig.shutdown();
    }
}
