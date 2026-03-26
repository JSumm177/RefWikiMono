# Fullstack App: React TypeScript Frontend + Java Backend (Docker)

This is a complete fullstack project featuring a React frontend written in TypeScript and a Java Servlet backend, built with Vite and Maven, and configured to run inside a single Docker container using Tomcat. Testing is configured for the frontend via Cypress.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- Node.js (v22 or later) to run the Cypress tests locally.
- npm (v10 or later)

## Getting Started

### 1. Build and Run the Server using Docker

To start the server, you will need to build the Docker image and run it. The `Dockerfile` uses a multi-stage build process to compile both the frontend and the backend and deploys them to Tomcat.

Open your terminal in the root directory of the project and run:

```bash
# Build the Docker image
docker build -t fullstack-app .

# Run the Docker container on port 8080
docker run -d -p 8080:8080 fullstack-app
```

The app will now be available at `http://localhost:8080`.
The Java Backend API is available under `http://localhost:8080/api/hello`.

### 2. Run the Cypress End-to-End Tests

Once the server is running on port 8080, you can run the end-to-end Cypress tests. The tests are located in the `frontend` directory.

In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install the dependencies (if you haven't already)
npm install

# Run the Cypress tests in the terminal
npm run test:e2e
```

Alternatively, you can open the interactive Cypress Test Runner:
```bash
npx cypress open
```

## Directory Structure

- `frontend/`: The React TypeScript application (Vite).
- `backend/`: The Java Maven project containing the servlet API.
- `Dockerfile`: Multi-stage Docker setup.
