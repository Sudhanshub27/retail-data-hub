FROM python:3.11-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    bash \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Pre-generate datasets and run Medallion pipeline to build analytics Gold layer
RUN bash scripts/generation.sh && \
    python3 src/ingestion/ingest_batch.py && \
    python3 src/ingestion/ingest_realtime.py && \
    python3 src/transformation/bronze_to_silver.py && \
    python3 src/transformation/silver_to_gold.py && \
    python3 src/analytics/commercial_kpis.py && \
    python3 src/analytics/operations_kpis.py && \
    python3 src/analytics/customer_kpis.py && \
    python3 src/analytics/executive_summary.py

EXPOSE 8000

CMD ["sh", "-c", "uvicorn src.api.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
