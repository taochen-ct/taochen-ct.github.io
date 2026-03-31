---
title: Network
prev:
    link: '/linux/commands'
    text: 'Basic Commands'
next:
    link: '/linux/systemd'
    text: 'Systemd'
---

# Linux Network Commands

## Configuration

```bash
# Show IP address
ip addr
ip a
ip addr show

# Show routing table
ip route
ip r

# Show network interfaces
ip link
ip -s link

# Add IP address
ip addr add 192.168.1.100/24 dev eth0

# Delete IP address
ip addr del 192.168.1.100/24 dev eth0

# Bring interface up/down
ip link set eth0 up
ip link set eth0 down
```

## old commands (deprecated but still used)

```bash
# Show IP address
ifconfig
ifconfig -a

# Set IP address
ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Bring up/down
ifconfig eth0 up
ifconfig eth0 down
```

## DNS

```bash
# Show DNS servers
cat /etc/resolv.conf

# Test DNS
nslookup example.com
dig example.com
host example.com
```

## Connectivity

```bash
# Ping
ping -c 4 example.com        # Ping 4 times
ping -i 0.2 example.com      # Interval 0.2s
ping -f example.com          # Flood ping
ping -s 1000 example.com     # Custom packet size

# Check port connectivity
nc -zv example.com 80        # TCP check
nc -zv example.com 80-90     # Port range

# Trace route
traceroute example.com
tracert example.com           # Windows
tracepath example.com
mtr example.com               # Continuous trace
```

## HTTP/Curl

```bash
# Basic GET
curl example.com
curl -O example.com/file     # Download with filename

# Request options
curl -X POST example.com     # POST request
curl -X PUT example.com      # PUT request
curl -d 'data' example.com   # POST data
curl -H 'Header: value' example.com  # Custom header
curl -L example.com          # Follow redirects
curl -k example.com          # Skip SSL verification
curl -v example.com          # Verbose
curl -s example.com          # Silent

# POST with JSON
curl -X POST example.com \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## wget

```bash
# Download
wget example.com/file
wget -O output.txt example.com  # Output to file
wget -c example.com/file         # Resume download
wget -r example.com              # Recursive (mirror)
wget -q example.com              # Quiet
```

## Port Scanning

```bash
# nmap
nmap example.com                # Basic scan
nmap -p 80 example.com          # Specific port
nmap -p 80-90 example.com       # Port range
nmap -sV example.com            # Service version
nmap -O example.com             # OS detection
nmap -A example.com             # Aggressive scan

# Netcat
nc -l -p 8080                   # Listen on port
nc example.com 80              # Connect to port
```

## SSH

```bash
# Connect
ssh user@hostname
ssh -p 2222 user@hostname       # Custom port
ssh -i key.pem user@hostname   # Identity file

# Key management
ssh-keygen                      # Generate key
ssh-copy-id user@hostname       # Copy key to server
ssh-add key.pem                 # Add key to agent

# SCP
scp file user@host:/path       # Copy to remote
scp user@host:/file .          # Copy from remote
scp -r dir user@host:/path     # Recursive

# SSHFS (mount remote)
sshfs user@host:/path /mount/point
```

## SFTP

```bash
sftp user@hostname

# Commands
ls              # List files
get file        # Download
put file        # Upload
get -r dir      # Download directory
put -r dir      # Upload directory
quit            # Exit
```

## Firewall (iptables)

```bash
# List rules
iptables -L -n
iptables -L -n -v

# Add rule
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -j DROP

# Delete rule
iptables -D INPUT 1

# Save rules
iptables-save > /etc/iptables.rules

# Load rules
iptables-restore < /etc/iptables.rules
```

## Firewall (firewalld)

```bash
# Service
firewall-cmd --list-all
firewall-cmd --list-services
firewall-cmd --list-ports

# Add service
firewall-cmd --add-service=http
firewall-cmd --remove-service=http

# Add port
firewall-cmd --add-port=8080/tcp
firewall-cmd --remove-port=8080/tcp

# Permanent
firewall-cmd --add-service=http --permanent
firewall-cmd --reload
```

## Network Stats

```bash
# Show network connections
ss -tuln                # TCP/UDP listening
ss -tan                 # All TCP connections
ss -tp                  # Show process

# Netstat (older)
netstat -tuln
netstat -an

# View routing table
route -n
ip route show

# ARP table
arp -a
ip neigh show

# Interface statistics
netstat -i
ip -s link
```

## curl examples

```bash
# API requests
# GET
curl https://api.example.com/users

# POST with JSON
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# PUT
curl -X PUT https://api.example.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane"}'

# DELETE
curl -X DELETE https://api.example.com/users/1

# With authentication
curl -H "Authorization: Bearer TOKEN" https://api.example.com/protected

# Download file
curl -O https://example.com/file.tar.gz

# Resume download
curl -C - -O https://example.com/large-file.tar.gz
```

## Proxy

```bash
# HTTP/HTTPS proxy
export http_proxy=http://proxy:8080
export https_proxy=http://proxy:8080

# curl with proxy
curl -x http://proxy:8080 example.com

# Environment
echo $http_proxy
```