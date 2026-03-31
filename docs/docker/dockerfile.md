---
title: Dockerfile
prev:
    link: '/docker/error'
    text: 'Error Solutions'
next:
    link: '/docker/compose'
    text: 'Docker Compose'
---

# Dockerfile Guide

## Basic Structure

```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "index.js"]
```

## Common Instructions

### FROM
```dockerfile
# Official image
FROM node:18

# Multi-stage build base
FROM golang:1.21-alpine AS builder
```

### WORKDIR
```dockerfile
WORKDIR /app
WORKDIR /app/src
WORKDIR /app/src/api
```

### COPY
```dockerfile
# Copy single file
COPY package.json .

# Copy directory
COPY . .

# Copy with build stage
COPY --from=builder /app/dist ./dist
```

### RUN
```dockerfile
# Shell form
RUN npm install

# Exec form (better for caching)
RUN ["npm", "install"]
```

### ENV
```dockerfile
ENV NODE_ENV=production
ENV PORT=8080
```

### EXPOSE
```dockerfile
EXPOSE 3000
EXPOSE 8080 8081
```

### CMD vs ENTRYPOINT

**CMD** - Default arguments (can be overridden):
```dockerfile
CMD ["node", "app.js"]
```

**ENTRYPOINT** - Command that always executes:
```dockerfile
ENTRYPOINT ["docker-entrypoint.sh"]
```

## Multi-stage Build Example

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Best Practices

1. **Use specific tags** - Avoid using `:latest`
2. **Layer caching** - Put less frequently changed instructions first
3. **Use .dockerignore** - Exclude unnecessary files
4. **Minimize layers** - Combine RUN commands
5. **Run as non-root** - Use USER instruction
6. **Use multi-stage builds** - Reduce final image size

## .dockerignore Example

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
dist
coverage
*.log
.DS_Store
```