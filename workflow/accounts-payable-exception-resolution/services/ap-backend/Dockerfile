# Container support is optional; ./run-local.sh is the primary local path.
# Build the jar first so this image needs no access to the private MicroTx Maven artifact.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/ap-backend.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
