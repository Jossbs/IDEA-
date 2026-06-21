# ───────────────────────────────────────────────────────────
# IDEA backend — multi-stage build
# Stage 1 compiles the JAR with Maven; stage 2 runs it on a slim JRE.
# ───────────────────────────────────────────────────────────

# ── Build stage ──
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (layer reused when only source changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Runtime stage ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a non-root user
RUN addgroup -S idea && adduser -S idea -G idea
USER idea

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
