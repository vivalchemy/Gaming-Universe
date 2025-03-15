FROM alpine:latest

WORKDIR /pb

# Install dependencies and download PocketBase
RUN apk add --no-cache curl && \
  curl -fsSL -o pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip" && \
  unzip pocketbase.zip && \
  rm pocketbase.zip && \
  chmod +x pocketbase

# Copy PocketBase migrations
COPY pb_migrations /pb/pb_migrations

# Expose PocketBase default port
EXPOSE 8090

# Run PocketBase with migration execution
CMD ["/pb/pocketbase", "migrate", "up", "--yes"] && ["/pb/pocketbase", "serve"]

