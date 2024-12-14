FROM oven/bun:1 AS base

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Install dependencies and build
WORKDIR /app
COPY . .
RUN bun install

# Backend stage
FROM base AS backend
WORKDIR /app
RUN groupadd -r -g 1001 bun || true && \
    id -u thanhhoajs &>/dev/null || useradd -r -u 1001 -g bun thanhhoajs
USER thanhhoajs
COPY --from=base /app /app
EXPOSE 2345
ENV PORT=2345
CMD ["bun", "prod"]

# Worker stage
FROM base AS worker
WORKDIR /app
COPY --from=base /app /app
CMD ["bun", "run", "prod:worker"]
