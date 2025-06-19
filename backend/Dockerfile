FROM golang:1.21-bullseye AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      git \
      libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-s -w" \
    -tags "sqlite_omit_load_extension" \
    -o main ./cmd/main.go

FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      sqlite3 \
      wget && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r appgroup && \
    useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /app/main .

RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENV DB_PATH=/app/data/library.db

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./main"]
