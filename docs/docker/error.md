---
title: Error Solutions
prev:
    link: '/docker/container'
    text: 'Container Commands'
next:
    link: '/docker/dockerfile'
    text: 'Dockerfile'
---

# Common Errors and Solutions

## 1. iptables: No chain/target/match by that name

**Cause**: Firewall was modified and restarted, causing iptables issues

**Check**:
```bash
# Check iptables
iptables -L -n

# Check if br_netfilter is loaded
lsmod | grep br_netfilter
```

**Solution**:
```bash
# Method 1: Restart Docker service
systemctl restart docker

# Method 2: Restart dockerd manually
ps -ef | grep dockerd
kill -9 <PID>
nohup dockerd > dockerd.log 2>&1 &
```

## 2. No space left on device

**Cause**: Docker root directory has insufficient disk space

**Check**:
```bash
# Check system disk space
df -h

# Check Docker data root
docker info | grep "Docker Root Dir"

# Check specific partition
df -hl <docker-data-root-path>
```

**Solution**:
1. Create/edit `/etc/docker/daemon.json`:
```json
{
    "data-root": "/new/path/for/docker"
}
```
2. Restart Docker service

**Prevention**: Configure data-root before starting Docker for the first time

## 3. Container process lacks permission

**Cause**: Container process lacks necessary privileges

**Solution**:

Using docker-compose:
```yaml
services:
  your-service:
    privileged: true
```

Using docker run:
```bash
docker run --privileged=true <image>
```

## 4. Connection refused / Connection reset

**Common Causes**:
- Container not running
- Port not exposed correctly
- Service inside container not started
- Firewall blocking

**Debug Steps**:
```bash
# Check if container is running
docker ps

# Check container logs
docker logs <container-name>

# Verify port mapping
docker port <container-name>

# Test connectivity from inside container
docker exec -it <container-name> curl localhost:<port>

# Check docker0 network
ip addr show docker0
```

## 5. Image pull failed

**Cause**: Network issues or authentication required

**Solutions**:
```bash
# Retry with mirror (China region)
docker pull dockerhub.azk8s.cn/<image>:<tag>

# Login to private registry
docker login <registry-url>

# Check DNS
docker info | grep -i dns
```