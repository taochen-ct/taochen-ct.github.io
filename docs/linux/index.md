---
title: Overview
prev: false
next:
    link: '/linux/commands'
    text: 'Basic Commands'
---

# Linux

Linux is a family of open-source Unix-like operating systems based on the Linux kernel.

## System Overview

- **Kernel**: The core of the OS, manages hardware resources
- **Shell**: Command interpreter (bash, zsh, sh)
- **File System**: Hierarchical directory structure
- **Users**: Multi-user system with permission management

## File System Structure

```
/               # Root directory
├── bin/        # Essential binaries
├── sbin/       # System binaries
├── etc/        # Configuration files
├── home/       # User home directories
├── root/       # Root user home
├── var/        # Variable files (logs, etc.)
├── usr/        # User programs
├── tmp/        # Temporary files
├── proc/       # Process information
├── dev/        # Device files
└── lib/        # Shared libraries
```

## Common Distributions

| Distribution | Based On | Package Manager |
|--------------|----------|-----------------|
| Ubuntu | Debian | apt |
| Debian | - | apt |
| CentOS | Red Hat | yum/dnf |
| RHEL | - | yum/dnf |
| Fedora | RHEL | dnf |
| Arch | - | pacman |
| openSUSE | - | zypper |

## Shell Basics

```bash
# Switch shell
bash
zsh
sh

# Environment variables
echo $PATH
export PATH=$PATH:/new/path

# Aliases
alias ll='ls -la'
alias gs='git status'
```

## Permissions

```
rwx r-x r-x  (755)
|  |  |
|  |  └── Others
|  └----- Group
└-------- Owner

r = 4 (read)
w = 2 (write)
x = 1 (execute)
```

```bash
# Change permissions
chmod 755 file
chmod +x script.sh

# Change owner
chown user:group file

# Numeric format
chmod 644 file  # rw-r--r--
chmod 700 file # rwx------
```