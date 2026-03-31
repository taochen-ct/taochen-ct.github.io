---
title: Docker Compose
prev:
    link: '/docker/dockerfile'
    text: 'Dockerfile'
---

# Docker Compose Guide

## Basic Example

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Build images
docker compose build

# View logs
docker compose logs -f

# List services
docker compose ps

# Execute command in service
docker compose exec web sh

# Scale service
docker compose up -d --scale web=3
```

## Service Configuration

### ports
```yaml
ports:
  - "3000:3000"        # host:container
  - "127.0.0.1:3000:3000"  # bind to specific IP
```

### environment
```yaml
environment:
  - NODE_ENV=production
  - DB_HOST=db
```

Or use env_file:
```yaml
env_file:
  - .env
```

### volumes
```yaml
volumes:
  - ./local-path:/container/path
  - named-volume:/data
  - /tmp:/tmp
```

### depends_on
```yaml
depends_on:
  - db
  - redis

# Wait for service to be healthy
depends_on:
  db:
    condition: service_healthy
```

### restart
```yaml
restart: no           # Don't restart
restart: on-failure   # Restart on failure
restart: always      # Always restart
restart: unless-stopped  # Restart unless stopped manually
```

### networks
```yaml
networks:
  - frontend
  - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

## Health Checks

```yaml
services:
  db:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## Profiles

```yaml
services:
  app:
    image: myapp

  debug:
    image: myapp:debug
    profiles:
      - debug
    command: sh

  load-test:
    image: myapp:load-test
    profiles:
      - load-test
```

Run with profile:
```bash
docker compose --profile debug up
```

## Production Example

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "80:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```