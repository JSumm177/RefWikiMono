# RefWikiMono

A fullstack monorepo featuring a React TypeScript frontend, a Java Servlet backend with MySQL, and a React Native mobile application.

## Project Overview

- **Frontend**: React (Vite, TypeScript, Cypress)
- **Backend**: Java Servlet (Maven, Tomcat, MySQL)
- **Mobile**: React Native (TypeScript, Jest)
- **Database**: MySQL 8.0

---

## Documentation

Detailed documentation and testing guides can be found hosted on GitHub Pages:
[https://jsumm177.github.io/RefWikiMono/](https://jsumm177.github.io/RefWikiMono/)

---

## Prerequisites

Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) (v22 or later)
- [Java JDK 21](https://adoptium.net/temurin/releases/?version=21)
- [Maven](https://maven.apache.org/download.cgi)
- [Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/) (for mobile development)

---

## Getting Started (Docker Compose)

The easiest way to run the entire stack (Database, Backend, and Frontend) connected is using Docker Compose.

1. **Setup Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(Optional: Edit `.env` to customize your database credentials)*

2. **Start the Database**:
   First, start the MySQL database container in the background:
   ```bash
   docker compose up -d db
   ```

3. **Start the Web Application**:
   Use the provided script to verify the database is running and start the web services (frontend and backend):
   ```bash
   ./start-web.sh
   ```

   **Troubleshooting Port 8080 Error**:
   If you receive an error like `Bind for 0.0.0.0:8080 failed: port is already allocated`, it means another container or local process (like Tomcat) is already using port 8080. You can stop existing containers by running:
   ```bash
   docker compose down
   ```
   Then try starting the database and web application again.

4. **Access the Applications**:
   - **Frontend**: [http://localhost:8080](http://localhost:8080)
   - **Backend API**: [http://localhost:8080/api/api/data](http://localhost:8080/api/api/data)
     *(Note: The first `/api` is the context path from `api.war`, the second is the servlet mapping.)*

---

## Viewing Logs

Both the Java backend application logs and the Tomcat server logs (Catalina and access logs) are unified and configured to stream directly to standard output (`stdout`) in plain text. This means you can view and manage all logs natively using Docker.

To view the live stream of logs for the entire web stack:

```bash
docker logs -f refwiki-app
```

*Note: `refwiki-app` is the default container name for the web service. If you started it via docker-compose, you can also use `docker compose logs -f app`.*

---

## Local Development

If you want to run the components separately for faster development iterations:

### 1. Database
You can start just the MySQL database using Docker:
```bash
docker compose up -d db
```

### 2. Backend (Java)
1. Ensure the database is running and environment variables are set in your shell:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_NAME=refwiki
   export DB_USER=wiki_user
   export DB_PASSWORD=wiki_password
   ```
2. Run the application using the Jetty Maven plugin:
   ```bash
   cd backend
   mvn jetty:run
   ```

### 3. Frontend (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. The frontend will be available at [http://localhost:5173](http://localhost:5173).
   *Note: To connect to the backend, ensure your API calls are relative or configured via a proxy in `vite.config.ts`.*

### 4. Mobile (React Native)
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   npm install
   ```
2. Start the Metro bundler:
   ```bash
   npm start
   ```
3. Run on Android or iOS:
   ```bash
   npm run android
   # OR
   npm run ios
   ```

---

## Testing

### Backend (Java)
To run the backend tests, you must have a running Docker daemon. The testing suite relies on:
- **JUnit 5**: Modern testing framework supporting features like `@Nested` and `@ParameterizedTest`.
- **Mockito**: Used for mocking dependencies (e.g., mail services or external APIs).
- **Testcontainers**: Requires Docker to spin up a temporary MySQL instance during test execution.

To execute the tests:
```bash
cd backend
mvn clean test
```

### Frontend End-to-End (Cypress)
Ensure the application is running (via Docker or local dev) and run:
```bash
cd frontend
npm run test:e2e
```

### Mobile Tests (Jest)
```bash
cd mobile
npm test
```

---

## Directory Structure

- `backend/`: Java Maven project (Servlets).
- `frontend/`: React Vite project (TypeScript).
- `mobile/`: React Native mobile app.
- `db/`: SQL initialization scripts.
- `docker-compose.yml`: Orchestrates DB and App services.
- `Dockerfile`: Multi-stage build for the web stack.
