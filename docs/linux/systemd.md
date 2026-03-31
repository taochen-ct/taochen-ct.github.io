---
title: Systemd
prev:
    link: '/linux/network'
    text: 'Network'
next: false
---

# Systemd

Systemd is a system and service manager for Linux.

## Basic Usage

```bash
# Start/Stop/Restart service
systemctl start nginx
systemctl stop nginx
systemctl restart nginx

# Enable/Disable at boot
systemctl enable nginx
systemctl disable nginx

# Status
systemctl status nginx

# Check if running
systemctl is-active nginx
systemctl is-enabled nginx
```

## Service Management

```bash
# List running services
systemctl list-units --type=service
systemctl list-units --type=service --state=running

# List all services
systemctl list-unit-files --type=service

# View service details
systemctl show nginx

# Reload configuration
systemctl daemon-reload
```

## Service Files

Location: `/etc/systemd/system/` or `/lib/systemd/system/`

Example: `myapp.service`

```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myuser
Group=mygroup
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/myapp
Restart=always
RestartSec=10

# Environment
Environment=PORT=8080
EnvironmentFile=/opt/myapp/.env

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

## Service Types

```ini
# simple     - Main process (default)
# exec       - Like simple but exec after pre-start
# forking    - Main process forks
# oneshot    - Runs once and exits
# notify     - Like simple but sends notify
# idle       - Delays start until idle
```

## Common Options

```ini
[Service]
# Restart policies
Restart=no           # Don't restart
Restart=on-failure   # Restart on failure
Restart=always       # Always restart
Restart=on-abnormal  # Restart on crash/timeout

# Time to wait before restart
RestartSec=5

# Dependencies
Requires=network.target    # Require network
After=network.target       # Start after network
Wants=nginx.service        # Weak dependency
```

## Journal Logs

```bash
# View logs
journalctl                     # All logs
journalctl -u nginx           # Service logs
journalctl -u nginx -n 50     # Last 50 lines
journalctl -f                 # Follow logs
journalctl --since "1 hour ago"

# Filter by priority
journalctl -p err
# 0 = emergency
# 3 = error
# 4 = warning
# 6 = info

# Time range
journalctl --since "2024-01-01" --until "2024-01-02"
```

## Timer (Cron alternative)

Example: `mytimer.timer`

```ini
[Unit]
Description=My Timer

[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Example: `mytask.service`

```ini
[Unit]
Description=My Task

[Service]
Type=oneshot
ExecStart=/opt/myscript.sh
```

Enable timer:

```bash
systemctl enable --now mytimer
systemctl list-timers
```

## Socket Activation

Example: `myapp.socket`

```ini
[Unit]
Description=My App Socket

[Socket]
ListenStream=/run/myapp.sock

[Install]
WantedBy=sockets.target
```

Example: `myapp.service`

```ini
[Unit]
Description=My App
Requires=myapp.socket

[Service]
ExecStart=/opt/myapp
StandardInput=socket
```

## Resource Limits

```ini
[Service]
# Memory limit
MemoryMax=1G
MemoryHigh=800M

# CPU limit
CPUQuota=50%

# Process limit
TasksMax=100
```

## Troubleshooting

```bash
# Failed services
systemctl list-units --state=failed

# Failed dependencies
systemctl list-dependencies nginx

# Check logs for failures
journalctl -xe

# Boot logs
journalctl -b
journalctl -b -u nginx

# Check configuration
systemd-analyze verify myapp.service
systemd-analyze dot | dot -Tsvg > system.svg
```

## Targets

```bash
# List targets
systemctl list-units --type=target

# Change target (runlevel)
systemctl isolate multi-user.target
systemctl isolate graphical.target

# Default target
systemctl set-default multi-user.target
systemctl get-default

# Common targets
# multi-user.target    - Non-graphical
# graphical.target    - Graphical
# rescue.target        - Single user mode
# emergency.target     - Emergency mode
```