# Multi-stage Dockerfile for Spring Boot Backend (Java 21)

# Stage 1: Build Application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy Maven POM and source code
COPY pom.xml .
COPY src ./src

# Package application JAR
RUN mvn clean package -DskipTests

# Stage 2: Production Lightweight Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Listen on platform-assigned PORT (Render passes PORT automatically)
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
