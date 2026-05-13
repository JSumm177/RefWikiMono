package com.example;

import org.hibernate.SessionFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class DatabaseConfigTest {

    @BeforeAll
    public static void setUp() {
        TestDatabaseUtil.startDatabase();
    }

    @Test
    public void testGetDataSource() {
        DataSource dataSource = DatabaseConfig.getDataSource();
        assertNotNull(dataSource, "DataSource should not be null");
    }

    @Test
    public void testGetSessionFactory() {
        SessionFactory sessionFactory = DatabaseConfig.getSessionFactory();
        assertNotNull(sessionFactory, "SessionFactory should not be null");
    }

    @Test
    public void testShutdown() {
        // Just verify it doesn't throw exceptions
        DatabaseConfig.shutdown();
        // Restart it for other tests if needed, but since it's a unit test for config, 
        // and we use TestDatabaseUtil.startDatabase() in other tests, it should be fine.
        // Actually, many tests depend on the static state of DatabaseConfig.
        // So we should restart it.
        TestDatabaseUtil.startDatabase();
    }
}
