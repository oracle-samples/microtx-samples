# Dockerfile for Doc Process MCP Server

FROM openjdk:17.0.2-jdk-slim

WORKDIR /app

# Copy the built JAR into the container
COPY target/doc-process-mcp-server-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8000

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
