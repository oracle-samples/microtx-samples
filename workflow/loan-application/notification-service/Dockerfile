# Use official OpenJDK base image
FROM openjdk:17.0.2-jdk-slim

# Set working directory in the container
WORKDIR /app

# Copy the built JAR into the container
COPY build/libs/notification-service-0.0.1.jar app.jar

# Expose the application port
EXPOSE 8085

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
