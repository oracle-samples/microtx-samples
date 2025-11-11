# Dockerfile for Loan Compliance Service

FROM openjdk:17.0.2-jdk-slim

WORKDIR /app

# Copy the built JAR into the container
COPY prebuilt/loan-compliance-service-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8001

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
