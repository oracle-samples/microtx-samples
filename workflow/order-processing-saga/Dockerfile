FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN pip install --no-cache-dir flask

# Copy application code
COPY mock_saga_server.py /app/

EXPOSE 8485

ENV FLASK_ENV=production

CMD ["python", "mock_saga_server.py"]
