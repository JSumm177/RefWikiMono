# Local Development Guide

The entire development environment (Database, API, Web UI, and Mobile Metro) can be launched with a single command:

```bash
npm run dev
```

## Service Endpoints

Once running, you can access the following services:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | React (Vite) dev server with HMR |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Java Servlet API (Jetty) |
| **Database Viewer** | [http://localhost:8082](http://localhost:8082) | Adminer (Web UI for MySQL) |
| **Mobile Metro** | [http://localhost:8081](http://localhost:8081) | Expo/React Native Bundler |
| **Unified Web** | [http://localhost:8080](http://localhost:8080) | Production build (via `./start-web.sh`) |

## Monorepo Commands (Turborepo)

Run these from the **root** directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch DB, Backend, Frontend, and Metro concurrently. |
| `npm run build` | Build all workspaces (Vite build + Maven package). |
| `npm run test` | Run all test suites (Vitest + JUnit + Jest). |
| `npm run clean` | Wipe all build artifacts and caches. |
| `npm run android` | Launch the mobile app on the Android emulator. |
| `npm run ios` | Launch the mobile app on the iOS simulator. |
