FROM python:3.6-slim-bullseye AS builder

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libcairo2 \
        libcairo2-dev && \
    pip install --user --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip

FROM python:3.6-slim-bullseye

WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY . .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libcairo2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
