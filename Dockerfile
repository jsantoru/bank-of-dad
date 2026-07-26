FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache su-exec

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite (will be mounted as volume)
RUN mkdir -p /app/data /app/data-init && chown -R nextjs:nodejs /app/data /app/data-init

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy initial database to a separate directory (not the mount point)
COPY --from=builder --chown=nextjs:nodejs /app/data/*.sqlite /app/data-init/

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    chown nextjs:nodejs /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run entrypoint as root to handle volume initialization, then switch to nextjs user
ENTRYPOINT ["/bin/sh", "-c", "if [ ! -f /app/data/bank-of-dad.sqlite ]; then echo 'Initializing database...'; cp /app/data-init/bank-of-dad.sqlite /app/data/bank-of-dad.sqlite && chown nextjs:nodejs /app/data/bank-of-dad.sqlite; fi && exec su-exec nextjs node server.js"]

