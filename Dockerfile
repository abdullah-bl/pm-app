# Stage 1: Build the Astro app
FROM oven/bun:1 AS builder

WORKDIR /app

# Build argument for PocketBase URL (needed at build time for client-side code)
ARG PUBLIC_POCKETBASE_URL=https://pm-db.fly.dev
ENV PUBLIC_POCKETBASE_URL=${PUBLIC_POCKETBASE_URL}

# Copy package files first for better layer caching
COPY package.json bun.lock ./

# Install all dependencies (including devDeps for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the Astro app
RUN bun run build

# Stage 2: Production runtime
FROM oven/bun:1-slim AS runtime

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy built output and production dependencies only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/api/health || exit 1

# Start the server
CMD ["bun", "./dist/server/entry.mjs"]
