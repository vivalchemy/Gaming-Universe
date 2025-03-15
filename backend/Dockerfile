FROM oven/bun:alpine as builder

WORKDIR /app

# Copy package and lock file first for efficient caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build TypeScript if needed (optional step, depends on your setup)
RUN bun run build

# Expose the port your app runs on (adjust if necessary)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "index.ts"]
