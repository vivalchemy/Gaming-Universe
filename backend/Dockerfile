FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package and lock file first for efficient caching
COPY backend/package.json backend/bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build TypeScript if needed (optional step, depends on your setup)
EXPOSE 3000

RUN pwd
RUN ls /
RUN ls /app

# Start the application
CMD ["bun", "run", "index.ts"]
