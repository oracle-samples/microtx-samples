# bank-mock - part of the MicroTx accounts-payable-exception-resolution sample.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8085

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8085

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
