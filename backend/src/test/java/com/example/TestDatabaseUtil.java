package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.testcontainers.containers.MySQLContainer;

import java.sql.Connection;
import java.sql.Statement;

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
            DatabaseConfig.setDataSourceForTesting(ds);

            initializeSchema();
            isInitialized = true;
        }
    }

    public static void stopDatabase() {
        // H2 in-memory DB will close when the JVM shuts down.
    }

    private static void initializeSchema() {
        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute("CREATE TABLE IF NOT EXISTS items (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(255) NOT NULL, " +
                    "description TEXT, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")");

            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "email VARCHAR(255) NOT NULL UNIQUE, " +
                    "password_hash VARCHAR(255) NOT NULL, " +
                    "role VARCHAR(20) DEFAULT 'USER', " +
                    "is_active BOOLEAN DEFAULT TRUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                    "last_login_at TIMESTAMP NULL" +
                    ")");

        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize test schema", e);
        }
    }

    public static void clearTables() {
        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("TRUNCATE TABLE users");
            stmt.execute("TRUNCATE TABLE items");
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear tables", e);
        }
    }
}