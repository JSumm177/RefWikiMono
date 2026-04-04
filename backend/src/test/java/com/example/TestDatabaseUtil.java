package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.testcontainers.containers.MySQLContainer;

import java.sql.Connection;
import java.sql.Statement;
import org.hibernate.Session;

public class TestDatabaseUtil {

    private static boolean isInitialized = false;

    public static void startDatabase() {
        if (!isInitialized) {
            // Because testcontainers doesn't work correctly in this restricted environment without a valid Docker setup
            // (despite properties), we fall back to an H2 in-memory database configured for MySQL compatibility.

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");

            System.setProperty("DB_HOST", "localhost");
            System.setProperty("DB_PORT", "3306");
            System.setProperty("DB_NAME", "testdb");
            System.setProperty("DB_USER", "sa");
            System.setProperty("DB_PASSWORD", "");

            HikariDataSource ds = new HikariDataSource(config);
            // This will also trigger Liquibase and Hibernate initialization
            DatabaseConfig.setDataSourceForTesting(ds);

            isInitialized = true;
        }
    }

    public static void stopDatabase() {
        // H2 in-memory DB will close when the JVM shuts down.
    }

    public static void clearTables() {
        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             Statement stmt = conn.createStatement()) {
            // Delete instead of truncate because of foreign keys or Liquibase
            stmt.execute("DELETE FROM users");
            stmt.execute("DELETE FROM items");
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear tables", e);
        }
    }
}
