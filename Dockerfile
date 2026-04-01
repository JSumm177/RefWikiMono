# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Build the Java backend
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
# Go offline to cache dependencies
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn package

# Stage 3: Setup Tomcat and deploy both frontend and backend
FROM tomcat:9.0-jdk21
# Remove default webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Ensure access logs go to stdout so they can be collected by Docker
RUN sed -i -e 's/directory="logs"/directory="\/dev"/' \
           -e 's/prefix="localhost_access_log"/prefix="stdout"/' \
           -e 's/suffix=".txt"/suffix="" rotatable="false"/' \
           /usr/local/tomcat/conf/server.xml

# Copy built frontend to Tomcat ROOT app
COPY --from=frontend-builder /app/frontend/dist /usr/local/tomcat/webapps/ROOT

# Copy built backend WAR to Tomcat
COPY --from=backend-builder /app/backend/target/api.war /usr/local/tomcat/webapps/api.war

EXPOSE 8080
CMD ["catalina.sh", "run"]