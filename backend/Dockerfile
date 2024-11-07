FROM oven/bun:1 AS base

# Install Node.js and enable corepack
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable

# Install dependencies and build
WORKDIR /app
COPY . .
RUN bun install

# Runtime stage
FROM base AS runner
WORKDIR /app

# Creating user and setting permissions with existence check
RUN groupadd -r -g 1001 bun || true && \
    id -u thanhhoajs &>/dev/null || useradd -r -u 1001 -g bun thanhhoajs

USER thanhhoajs
COPY --from=base /app /app
EXPOSE 2345
ENV PORT=2345
CMD ["bun", "prod"]
