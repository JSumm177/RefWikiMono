# RefWikiMono

A fullstack monorepo featuring a React TypeScript frontend, a Java Servlet backend with MySQL, and a React Native mobile application.

## Project Overview

- **Frontend**: React (Vite, TypeScript, Cypress)
- **Backend**: Java Servlet (Maven, Tomcat, MySQL)
- **Mobile**: React Native (TypeScript, Jest)
- **Database**: MySQL 8.0

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

2. **Start the Services**:
   From the root directory, run:
   ```bash
   docker-compose up --build
   ```

3. **Access the Applications**:
   - **Frontend**: [http://localhost:8080](http://localhost:8080)
   - **Backend API**: [http://localhost:8080/api/api/data](http://localhost:8080/api/api/data)
     *(Note: The first `/api` is the context path from `api.war`, the second is the servlet mapping.)*

---

## Local Development

If you want to run the components separately for faster development iterations:

### 1. Database
You can start just the MySQL database using Docker:
```bash
docker-compose up -d db
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
2. Build the WAR file:
   ```bash
   cd backend
   mvn clean package
   ```
3. Deploy the `target/api.war` to your local Tomcat instance (port 8080).

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
