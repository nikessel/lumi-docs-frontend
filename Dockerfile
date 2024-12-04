# Use Node.js 23.3.0 as the base image
FROM node:23.3.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1

# Modify the build command to skip linting
RUN NODE_ENV=production npm run build || npm run build -- --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files and necessary configs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy WebAssembly files
COPY --from=builder /app/public/pkg ./public/pkg

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set default environment variables
ENV API_URL=http://localhost:8080/api
ENV FORWARDED_HOST=localhost:3000
ENV FORWARDED_PROTO=http

# Start the application
CMD ["node", "server.js"]
