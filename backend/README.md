# Backend Testing Guide

This guide covers the technical specifics of the Java backend testing suite in RefWikiMono.

## Environment Requirements
**Crucial Requirement: A running Docker daemon is mandatory for executing tests.**
The test suite utilizes Testcontainers, which spins up a temporary, isolated MySQL container specifically for integration and database tests. Without a running Docker daemon, the tests will fail.

## Testing Architecture
The backend testing stack is built upon modern Java testing tools to ensure high code coverage and reliable behavior:

- **JUnit 5**: Used as the primary testing framework. Developers can leverage modern features such as `@Nested` for grouping related tests and `@ParameterizedTest` for running the same test with different inputs.
- **Mockito**: Employed for mocking external dependencies or specific services (like mail services, external APIs, or Servlet requests/responses) to isolate unit tests.
- **Testcontainers**: Automatically provisions a temporary MySQL container during the test lifecycle to ensure database tests interact with a real MySQL instance, mimicking the production environment closely.

## Executing the Tests
To run the full suite of backend tests, navigate to the `backend` directory and execute Maven's test phase:

```bash
cd backend
mvn clean test
```

## Troubleshooting
- **Docker Connection Refused**: If you see errors indicating that Testcontainers cannot connect to Docker or the Docker daemon is not running, ensure that Docker Desktop (or your Docker engine) is started and accessible by your user.
- **Missing Environment Variables**: While the `maven-surefire-plugin` is configured to inject system property variables (like `IS_TEST_ENV` and `JWT_SECRET_TEST`) to bypass strict production checks, ensure you are running tests using Maven (`mvn clean test`) rather than running individual test classes directly through an IDE without setting these properties.
