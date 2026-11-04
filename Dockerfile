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

# Copy application source code including pre-built Gold tables and analytics
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn src.api.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
