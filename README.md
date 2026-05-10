# RefWikiMono

A hardened, fullstack monorepo managed with **Turborepo**, featuring a React TypeScript frontend, a Java Servlet backend, and a React Native application with Expo CNG. RefWiki is a social rulebook platform designed to help fans and officials understand live game penalties through community consensus.

## 🚀 Quick Start (Local Development)

The entire development environment (Database, API, Web UI, and Mobile Metro) can be launched with a single command:

```bash
./start-dev.sh
```

### 📍 Service Endpoints
Once running, you can access the following services:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | React (Vite) dev server with HMR |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Java Servlet API (Jetty) |
| **Database Viewer** | [http://localhost:8082](http://localhost:8082) | Adminer (Web UI for MySQL) |
| **Mobile Metro** | [http://localhost:8081](http://localhost:8081) | Expo/React Native Bundler |
| **Unified Web** | [http://localhost:8080](http://localhost:8080) | Production build (via `./start-web.sh`) |

---

## ✨ Key Features

- **Multi-Sport Rule Engine**: High-performance database-backed search for NFL, NCAA, NBA, MLB, NHL, and MLS.
- **Community Feed**: Fans can publish "Calls" from live games to a global social feed.
- **"Hall of Shame" Leaderboard**: Real-time ranking of the most controversial calls based on community voting.
- **Live Voting System**: Users can vote on a 1-5 "Controversy Scale" to build community consensus.
- **Cross-Platform Sync**: Persistent bookmarks (stars) and call history synced between Web and Mobile.
- **Security Hardened**: BCrypt hashing, JWT session management, CORS whitelisting, and environment-aware secure cookies.

---

## 🏗 Project Architecture

- **Workspaces**: Managed by Turborepo for efficient building and caching.
- **Frontend**: React (Vite, TypeScript, Vitest). Uses a custom context-based state management for Auth, Bookmarks, and Call History.
- **Backend**: Java Servlet (Maven, Jetty). Uses Hibernate ORM with MySQL and Liquibase for version-controlled schema migrations.
- **Mobile**: React Native (Expo CNG). Native folders are automatically generated from `app.json`.
- **Database**: MySQL 8.0 with `FULLTEXT` indexing for natural language rule searching.
- **Infrastructure**: Docker Compose for unified networking and environment-consistent services.

---

## 🛠 Prerequisites

Ensure you have the following installed and running:
- **Docker Desktop**: Mandatory for the Web Stack (DB, API, Frontend, Adminer).
- **Node.js**: v22 or later (LTS).
- **Java JDK 21**: Required for Maven and Android builds.
- **Android SDK & NDK**: Version 27.x required for New Architecture builds.
- **Xcode / Android Studio**: For mobile simulation.

---

## 📦 Monorepo Commands (Turborepo)

Run these from the **root** directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch DB, Backend, Frontend, and Metro concurrently. |
| `npm run build` | Build all workspaces (Vite build + Maven package). |
| `npm run test` | Run all test suites (Vitest + JUnit + Jest). |
| `npm run clean` | Wipe all build artifacts and caches. |
| `npm run android` | Launch the mobile app on the Android emulator. |
| `npm run ios` | Launch the mobile app on the iOS simulator. |

---

## 📱 Mobile Development (Expo CNG)

The mobile project uses **Continuous Native Generation**. You should generally not edit the `ios` or `android` folders directly.

### 🌍 Network Discovery
The project includes a custom stabilization plugin (`mobile/plugins/withStabilization.js`) that automatically detects your machine's local IP address and injects it into the mobile builds, ensuring they can always find the Metro bundler across your local network.

---

## 🐳 Production Build

To build and run the production-ready unified container (Tomcat serving both API and Frontend):

1. **Start the DB**: `docker compose up -d db`
2. **Build and Run**: `./start-web.sh`
3. **Access**: [http://localhost:8080](http://localhost:8080)

---

## 📝 Documentation

Detailed documentation and testing guides:
[https://jsumm177.github.io/RefWikiMono/](https://jsumm177.github.io/RefWikiMono/)
