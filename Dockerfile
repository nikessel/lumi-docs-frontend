# Stage 1: Build
FROM node:23.3.0-alpine AS builder
WORKDIR /app
# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci
# Copy source code and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

# Ensure WASM file exists before build
RUN if [ ! -f public/pkg/app_bg.wasm ]; then \
    echo "Error: app_bg.wasm is missing from public/pkg/" && \
    exit 1; \
    fi

RUN NODE_ENV=production npm run build -- --no-lint

# Stage 2: Runner
FROM node:23.3.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions and user
RUN chown -R nextjs:nodejs /app
USER nextjs
# Configure environment and startup
EXPOSE 3000
ENV API_URL=http://localhost:8180 \
    FORWARDED_HOST=localhost \
    FORWARDED_PROTO=http

CMD ["node", "server.js"]
