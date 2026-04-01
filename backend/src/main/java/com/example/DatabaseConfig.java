package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;

public class DatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
    private static HikariDataSource dataSource;

    static {
        String dbHost = System.getenv("DB_HOST");
        String dbPort = System.getenv("DB_PORT");
        String dbName = System.getenv("DB_NAME");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASSWORD");

        // Allow bypassing strict env var check if we are in a test environment
        if (dbHost == null || dbPort == null || dbName == null || dbUser == null || dbPass == null) {
            logger.warn("One or more database environment variables are missing.");
            if (System.getProperty("IS_TEST_ENV") != null) {
                // Read from system properties instead, or use dummy if still missing
                dbHost = System.getProperty("DB_HOST", "localhost");
                dbPort = System.getProperty("DB_PORT", "3306");
                dbName = System.getProperty("DB_NAME", "testdb");
                dbUser = System.getProperty("DB_USER", "test");
                dbPass = System.getProperty("DB_PASSWORD", "test");
            } else {
                throw new RuntimeException("Database environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD) must be set.");
            }
        }

        if (System.getProperty("IS_TEST_ENV") != null && "localhost".equals(dbHost)) {
            logger.info("Test environment detected. Delaying database initialization.");
            // Delay initialization for tests since testcontainers hasn't started yet.
            // The TestDatabaseUtil will call setDataSourceForTesting.
        } else {
            logger.info("Initializing database connection pool to jdbc:mysql://{}:{}/{}", dbHost, dbPort, dbName);
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName + "?allowPublicKeyRetrieval=true&useSSL=false");
            config.setUsername(dbUser);
            config.setPassword(dbPass);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

            dataSource = new HikariDataSource(config);
        }
    }

    public static DataSource getDataSource() {
        return dataSource;
    }

    // Visible for testing
    public static void setDataSourceForTesting(HikariDataSource testDataSource) {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
        dataSource = testDataSource;
    }
}
