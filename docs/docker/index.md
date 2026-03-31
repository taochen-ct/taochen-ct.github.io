---
title: Overview
next:
    link: '/docker/container'
    text: 'Container Commands'
prev: false
---

# Docker

Docker is an open platform for developing, shipping, and running applications using containerization technology.

## Basic Commands

### Images
```bash
# List images
docker images
docker image ls

# Pull image
docker pull <image-name>:<tag>

# Remove image
docker rmi <image-id or name>

# Build image from Dockerfile
docker build -t <image-name>:<tag> .

# Tag image
docker tag <source-image> <target-image>

# Push image to registry
docker push <image-name>:<tag>
```

### Containers
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Run container
docker run -d --name <container-name> -p <host-port>:<container-port> <image>

# Start/Stop container
docker start <container-name>
docker stop <container-name>

# Restart container
docker restart <container-name>

# Remove container
docker rm <container-name>

# View container logs
docker logs -f <container-name>

# Execute command in running container
docker exec -it <container-name> /bin/bash

# Inspect container details
docker inspect <container-name>

# View container resource usage
docker stats <container-name>
```

### Volumes
```bash
# List volumes
docker volume ls

# Create volume
docker volume create <volume-name>

# Remove volume
docker volume rm <volume-name>

# Inspect volume
docker volume inspect <volume-name>
```

### Network
```bash
# List networks
docker network ls

# Create network
docker network create <network-name>

# Inspect network
docker network inspect <network-name>

# Connect container to network
docker network connect <network-name> <container-name>
```

### System
```bash
# Docker system info
docker info

# Docker disk usage
docker system df

# Clean up unused data
docker system prune

# Remove all unused images
docker image prune -a

# Remove all stopped containers
docker container prune
```