# Dockerfile for the On-Premise OCR Microservice (FastAPI + EasyOCR)
FROM python:3.13-slim

# Install optional build/system dependencies for some pip packages (e.g. opencv)
RUN apt-get update && \
    apt-get install -y gcc && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Explicitly copy samples_for_ocr directory and its contents
COPY samples_for_ocr/ samples_for_ocr/

# Copy .EasyOCR contents to ~/.EasyOCR/model/ inside container
RUN mkdir -p ~/.EasyOCR/model/ && cp -r /app/.EasyOCR/* ~/.EasyOCR/model/

# Expose FastAPI/Uvicorn port
EXPOSE 8000

# Environment variable to avoid Python buffering issues
ENV PYTHONUNBUFFERED=1

# Default command: Start the FastAPI server with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
