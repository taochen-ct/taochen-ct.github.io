---
title: Offline Install
prev:
    link: '/docker/compose'
    text: 'Docker Compose'
next:
    link: '/docker/rustfs'
    text: 'RustFS Distributed Cluster'
---

# Offline Install Docker & Docker Compose

Production environments often live in air-gapped networks — no `apt`, no `yum`, no public registry. This guide walks through installing Docker Engine and Docker Compose on a Linux host with **zero network access**, using only static binaries copied over from a connected machine.

> 🎯 Tested on **Docker 24.0.6** (static tarball) + **Compose v2.27.0** (GitHub release binary), x86_64 Linux.

## When You Need This

- Production servers in isolated networks (finance, government, internal infra)
- Customer on-prem deployments where you ship binaries, not package managers
- Disaster recovery: rebuilding a host without internet access
- CI runners inside a sealed VPC

## High-Level Flow

```
Connected machine                           Air-gapped host
─────────────────                           ───────────────
①  wget docker-24.0.6.tgz                   ④  tar + cp to /usr/bin
②  wget docker-compose-linux-x86_64         ⑤  write systemd unit
                                            ⑥  systemctl start docker
③  scp / USB ───────────────────────────►   ⑦  docker run hello-world
```

## 1. Download Binaries (Connected Machine)

```bash
# Docker Engine — official static archive
wget https://download.docker.com/linux/static/stable/x86_64/docker-24.0.6.tgz

# Docker Compose — GitHub release binary
wget https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64
```

> 💡 **Tip:** Always pin versions. Don't grab "latest" symlinks for reproducible installs. Check [Docker releases](https://download.docker.com/linux/static/stable/x86_64/) and [Compose releases](https://github.com/docker/compose/releases) for newer versions if 24.0.6 / v2.27.0 are too old for your stack.

Transfer both files to the offline host under `/opt/docker-offline` via scp, USB, or your internal file transfer tool.

## 2. Install Docker Engine

### Extract & Install Binaries

```bash
tar -zxvf docker-24.0.6.tgz
cp docker/* /usr/bin/
```

The tarball contains `docker`, `dockerd`, `containerd`, `runc`, `containerd-shim`, etc. — everything the engine needs.

### systemd Service Unit

Create `/etc/systemd/system/docker.service`:

```ini
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=infinity
LimitNPROC=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
```

> Key flags explained:
> - `Type=notify` — dockerd signals readiness via `sd_notify`; required for `systemctl start` to actually wait for engine ready.
> - `Delegate=yes` — lets systemd hand cgroup ownership to dockerd; required for cgroup v2 cgroup driver (`cgroupfs` driver can skip it).
> - `LimitNOFILE=infinity` — high fd limit; container workloads open lots of sockets.

### Start & Verify

```bash
systemctl daemon-reload
systemctl start docker
systemctl enable docker

docker --version    # → Docker version 24.0.6
docker info         # full engine status
```

## 3. Install Docker Compose

```bash
mv docker-compose-linux-x86_64 /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version    # → Docker Compose version v2.27.0

# Optional: legacy path compatibility
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

> ⚠️ **Compose v2 caveat:** The official v2 CLI is distributed as a Docker CLI plugin, not a standalone binary. The new syntax is `docker compose` (space, no hyphen), and the plugin lives under `~/.docker/cli-plugins/docker-compose`. The legacy `docker-compose` (hyphen) form still works for backward compatibility — that's what this guide installs. If you're starting fresh, prefer the plugin path: `mv docker-compose-linux-x86_64 ~/.docker/cli-plugins/docker-compose`.

## 4. Recommended Configurations

Both configs go in `/etc/docker/daemon.json` (create if missing). Merge into one file if you need both:

```json
{
    "registry-mirrors": ["https://<your-mirror-id>.mirror.aliyuncs.com"],
    "data-root": "/opt/docker-data"
}
```

| Setting | Purpose |
|---|---|
| `registry-mirrors` | Pull through an internal mirror (Aliyun / Harbor / Nexus). Essential if your offline network has an internal registry — the engine still needs *some* pull endpoint. |
| `data-root` | Move Docker's data dir off the root partition. Default is `/var/lib/docker`; large image layers will fill `/` quickly. |

Reload after edits:

```bash
systemctl restart docker
```

## 5. Offline Image Import

Docker installed but no images is still an empty shell. You still need to ship images in.

### On the Connected Machine

```bash
# Pull what you need
docker pull nginx:alpine
docker pull redis:7-alpine
docker pull your-internal/app:v1.2.3

# Export to tarballs
docker save -o nginx-alpine.tar nginx:alpine
docker save -o redis-7.tar redis:7-alpine
docker save -o app-v1.2.3.tar your-internal/app:v1.2.3
```

### On the Offline Host

```bash
docker load -i nginx-alpine.tar
docker load -i redis-7.tar
docker load -i app-v1.2.3.tar

docker images   # confirm they're in
```

> 💡 **Bake multiple images into one tar:** `docker save -o combined.tar image1:tag image2:tag image3:tag` — `docker load` will restore all of them.

## 6. Verification

```bash
# Quick smoke test
docker run --rm hello-world
# Should print "Hello from Docker!"

# Run a real workload
docker run -d --name nginx-test -p 8080:80 nginx:alpine
curl http://localhost:8080
docker rm -f nginx-test
```

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `docker: command not found` | Check `/usr/bin/docker*` exists; re-run `cp docker/* /usr/bin/` |
| `Failed to start docker` | `journalctl -u docker.service -n 50 --no-pager` — common cause: another process holds `/var/run/docker.sock` |
| `docker-compose: command not found` | Re-`chmod +x` the binary, check `$PATH` includes `/usr/local/bin` |
| `permission denied` on `/var/run/docker.sock` | Add user to `docker` group: `usermod -aG docker <user>` then re-login |
| Pull still fails after mirror config | Mirror host unreachable from this network — you don't actually have a registry, fix the `registry-mirrors` value |

## 8. Uninstall

```bash
systemctl stop docker
systemctl disable docker
rm -rf /usr/bin/docker*
rm -f /etc/systemd/system/docker.service
rm -rf /var/lib/docker     # ⚠️ nukes all images, containers, volumes
systemctl daemon-reload
```

## Production Checklist

- [ ] Versions pinned in your internal docs (don't leave "latest" anywhere)
- [ ] systemd unit customized for your cgroup driver and ulimits
- [ ] `data-root` moved off root partition
- [ ] Registry mirror points at your **internal** Harbor/Nexus, not a public one
- [ ] Image tarballs include **all** transitive images (use `docker save` with multiple args)
- [ ] Hello-world smoke test passed before shipping to the target host
- [ ] Rollback plan: keep the previous version's binaries in `/opt/docker-offline/previous/`