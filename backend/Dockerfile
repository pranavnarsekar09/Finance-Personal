# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Prefetch dependencies to speed up subsequent builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy only the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port
EXPOSE 8080

# Run with memory optimizations for limited free-tier environments
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]