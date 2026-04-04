package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import java.sql.Connection;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.cfg.Environment;
import java.util.Properties;

public class DatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
    private static HikariDataSource dataSource;
    private static SessionFactory sessionFactory;

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
            runLiquibaseMigrations(dataSource);
            initHibernateSessionFactory(dataSource);
        }
    }

    private static void initHibernateSessionFactory(DataSource ds) {
        try {
            Configuration configuration = new Configuration();

            Properties settings = new Properties();
            settings.put(Environment.JAKARTA_JDBC_URL, dataSource.getJdbcUrl());
            settings.put(Environment.JAKARTA_JDBC_USER, dataSource.getUsername());
            settings.put(Environment.JAKARTA_JDBC_PASSWORD, dataSource.getPassword());
            settings.put(Environment.DIALECT, "org.hibernate.dialect.MySQLDialect");
            settings.put(Environment.SHOW_SQL, "false");
            settings.put(Environment.CURRENT_SESSION_CONTEXT_CLASS, "thread");
            // Important: tell hibernate not to create the schema, liquibase does it
            settings.put(Environment.HBM2DDL_AUTO, "none");

            configuration.setProperties(settings);

            // Add annotated classes
            configuration.addAnnotatedClass(com.example.User.class);

            // We supply a custom connection provider to use the Hikari datasource
            // OR simply let Hibernate use its default mechanism with the JDBC properties provided above
            // Using properties above for simplicity as it creates its own pool if not provided a provider,
            // but sharing the Hikari pool is better:
            configuration.getProperties().put(Environment.DATASOURCE, ds);

            sessionFactory = configuration.buildSessionFactory();
            logger.info("Hibernate SessionFactory initialized successfully.");
        } catch (Exception e) {
            logger.error("Failed to initialize Hibernate SessionFactory", e);
            throw new ExceptionInInitializerError(e);
        }
    }

    private static void runLiquibaseMigrations(DataSource ds) {
        try (Connection connection = ds.getConnection()) {
            Database database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            Liquibase liquibase = new Liquibase("db/changelog/db.changelog-master.xml", new ClassLoaderResourceAccessor(), database);
            liquibase.update("");
            logger.info("Liquibase migrations ran successfully.");
        } catch (Exception e) {
            logger.error("Failed to run Liquibase migrations", e);
            throw new RuntimeException(e);
        }
    }

    public static DataSource getDataSource() {
        return dataSource;
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    // Visible for testing
    public static void setDataSourceForTesting(HikariDataSource testDataSource) {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
        if (sessionFactory != null && !sessionFactory.isClosed()) {
            sessionFactory.close();
        }
        dataSource = testDataSource;
        runLiquibaseMigrations(dataSource);
        initHibernateSessionFactory(dataSource);
        dataSource = testDataSource;
    }
}
