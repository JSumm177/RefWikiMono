# RefWikiMono

A hardened, fullstack monorepo managed with **Turborepo**, featuring a React TypeScript frontend, a Java Servlet backend, and a React Native application with Expo CNG.

## 🚀 Quick Start (Local Development)

The entire development environment (Database, API, Web UI, and Mobile Metro) can be launched with a single command:

```bash
./start-dev.sh
```

This command orchestrates:
- **Database**: MySQL 8.0 in Docker.
- **Backend API**: Java Servlet app running in a Maven container (Port 8080).
- **Frontend UI**: React Vite app running in a Node container (Port 5173).
- **Mobile Metro**: React Native bundler running on your host (Port 8081).

---

## 🏗 Project Architecture

- **Workspaces**: Managed by Turborepo for efficient building and caching.
- **Frontend**: React (Vite, TypeScript, Vitest). Now fully containerized.
- **Backend**: Java Servlet (Maven, Jetty). Runs in Docker with explicit DNS for dependency resolution.
- **Mobile**: React Native (Expo CNG). Native folders are automatically generated from `app.json`.
- **Infrastructure**: Docker Compose for unified networking between all web components.

---

## 🛠 Prerequisites

Ensure you have the following installed and running:
- **Docker Desktop**: Mandatory for the Web Stack (DB, API, Frontend).
- **Node.js**: v22 or later.
- **Java JDK 21**: Required for Maven and Android builds.
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

### 🔄 Resetting Native Folders
If the native build becomes corrupted or you change native configuration in `app.json`, reset them:
```bash
cd mobile
npx expo prebuild --clean
```

### 🌍 Network Discovery
The project includes a custom stabilization plugin (`mobile/plugins/withStabilization.js`) that automatically detects your machine's local IP address and injects it into the mobile builds, ensuring they can always find the Metro bundler.

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
