FROM alpine:latest

WORKDIR /pb

# Install dependencies
RUN apk add --no-cache curl unzip

ENV PB_VERSION=0.22.22

# Download and extract PocketBase
RUN curl -fsSL -o pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" && \
  unzip pocketbase.zip && \
  rm pocketbase.zip && \
  chmod +x pocketbase


# Copy PocketBase migrations
COPY /pocketbase/pb_migrations /pb/pb_migrations

# Expose PocketBase default port
EXPOSE 8090

# Run PocketBase with migration execution
CMD ["/pb/pocketbase", "serve" , "--http=0.0.0.0:8090"]
