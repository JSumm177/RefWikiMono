# Backend Guide

This guide covers the technical specifics of the Java backend in RefWikiMono.

## Development Environment

The Java 21 backend is designed to run locally for development using a Docker Compose service (`backend-dev`). This ensures a consistent environment without requiring a local Java/Maven installation on your host machine.

### How it Works:
- **Base Image:** It uses a `maven:3.9-eclipse-temurin-21` image.
- **Volume Mounting:** It mounts your local `backend/` directory into the container at `/app`. This means any changes you make to the Java code are immediately available inside the container.
- **Dependency Caching:** It utilizes a Docker Volume (`maven-repo`) mapped to `/root/.m2` to cache Maven dependencies locally across restarts.
- **Execution:** It runs `mvn jetty:run` to start a lightweight Jetty web server, mapped to port 8080 on your host.

To start the backend development environment (which will also start the required MySQL database):
```bash
# From the repository root
docker compose up backend-dev
```

## Testing Guide

This section covers the technical specifics of the Java backend testing suite.

### Environment Requirements
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
