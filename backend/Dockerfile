FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package and lock file first for efficient caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build TypeScript if needed (optional step, depends on your setup)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "index.ts"]
