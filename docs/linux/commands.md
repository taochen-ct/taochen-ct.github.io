---
title: Basic Commands
prev:
    link: '/linux'
    text: 'Overview'
next:
    link: '/linux/network'
    text: 'Network'
---

# Linux Basic Commands

## File Operations

```bash
# List files
ls              # Basic list
ls -l           # Detailed list
ls -a           # Include hidden
ls -la          # Combined
ls -lh          # Human readable size
ls -R           # Recursive

# Change directory
cd /path        # Absolute path
cd ..           # Parent directory
cd ~            # Home directory
cd -            # Previous directory

# Create
touch file              # Create empty file
mkdir dir               # Create directory
mkdir -p dir/subdir     # Create nested directories
mkdir -p dir/{a,b,c}    # Multiple directories

# Copy
cp file newfile         # Copy file
cp -r dir newdir        # Copy directory
cp -i file newfile      # Interactive (confirm)
cp -v file newfile      # Verbose

# Move/Rename
mv file newfile         # Move or rename
mv -i file newfile      # Interactive

# Remove
rm file                 # Delete file
rm -r dir              # Delete directory
rm -rf dir             # Force delete (careful!)
rm -i file             # Interactive

# View files
cat file                # View entire file
less file              # Page through file
head -n file           # First n lines
tail -n file           # Last n lines
tail -f file           # Follow file (logs)
```

## Text Operations

```bash
# Search
grep "pattern" file            # Search in file
grep -r "pattern" dir/         # Recursive search
grep -i "pattern" file         # Case insensitive
grep -n "pattern" file         # Show line numbers
grep -v "pattern" file         # Invert match

# Find
find /path -name "*.txt"       # Find by name
find /path -type d             # Find directories
find /path -type f -size +10M  # Find files >10MB
find /path -mtime -1           # Modified in last day

# Sed
sed 's/old/new/g' file         # Replace
sed -i 's/old/new/g' file     # In-place replace
sed '1d' file                  # Delete first line
sed '1,5d' file               # Delete lines 1-5

# Awk
awk '{print $1}' file          # Print first column
awk -F: '{print $1}' file      # Use : as delimiter
awk '/pattern/ {print}' file   # Print matching lines

# Sort
sort file                     # Sort lines
sort -u file                  # Sort unique
sort -k2 file                 # Sort by column 2
sort -r file                  # Reverse sort

# Cut
cut -d: -f1 file              # Cut by delimiter
cut -c1-10 file               # Cut by character
```

## Process Management

```bash
# Process info
ps             # Current shell processes
ps -e          # All processes
ps -ef         # Full format
ps aux         # BSD format
top            # Interactive process viewer
htop           # Enhanced top (if installed)

# Kill process
kill <PID>                 # Terminate gracefully
kill -9 <PID>              # Force kill
killall process_name       # Kill by name
pkill process_name         # Kill by pattern

# Background
command &                  # Run in background
ctrl+z                     # Pause and background
bg                         # Resume in background
fg                         # Bring to foreground
jobs                       # List background jobs
```

## Disk Usage

```bash
# Disk space
df              # Disk usage
df -h           # Human readable
df -h /path     # Specific partition

# Directory size
du /path        # Directory size
du -sh /path    # Total size only
du -h --max-depth=1  # One level deep

# Disk usage by type
ncdu            # Interactive disk analyzer
```

## Disk Mounting

### Basic Mount

```bash
# View disk info
lsblk                    # List block devices
fdisk -l                 # Disk detailed info

# Create mount point
mkdir /data

# Mount
mount /dev/sdb1 /data

# Unmount
umount /data

# View mounted
mount | grep /data
df -h /data
```

### LVM (Logical Volume Manager)

```bash
# Create Physical Volume (PV)
pvcreate /dev/sdb /dev/sdc

# View PV
pvdisplay
pvs

# Create Volume Group (VG)
vgcreate my_vg /dev/sdb /dev/sdc

# View VG
vgdisplay
vgs

# Create Logical Volume (LV)
lvcreate -l 100%FREE -n my_lv my_vg

# Or specify size
lvcreate -L 50G -n my_lv my_vg

# View LV
lvdisplay
lvs

# Format
mkfs.ext4 /dev/my_vg/my_lv

# Mount
mount /dev/my_vg/my_lv /data

# Extend VG
vgextend my_vg /dev/sdd

# Extend LV
lvextend -l +100%FREE /dev/my_vg/my_lv

# Resize filesystem
resize2fs /dev/my_vg/my_lv

# Remove LV
lvremove /dev/my_vg/my_lv

# Remove VG
vgremove my_vg

# Remove PV
pvremove /dev/sdb
```

### Auto Mount (fstab)

```bash
# Edit fstab
vim /etc/fstab

# Add line (format: device  mount_point  fs_type  options  dump  fsck)
# Example:
/dev/my_vg/my_lv  /data  ext4  defaults  0 0

# Options:
# defaults = rw, suid, dev, exec, auto, nouser, async
# noauto    = don't mount on boot
# nofail    = ignore errors
# ro        = read-only

# Verify before reboot
mount -a
```

### Swap

```bash
# Create swap file
dd if=/dev/zero of=/swapfile bs=1M count=2048
mkswap /swapfile
swapon /swapfile

# Add to fstab
/swapfile  none  swap  sw  0  0

# Remove swap
swapoff /swapfile
rm /swapfile
```

## Archives

```bash
# tar
tar -cvf archive.tar dir/       # Create
tar -tvf archive.tar            # List
tar -xvf archive.tar            # Extract
tar -czvf archive.tar.gz dir/   # Create gzip
tar -xzvf archive.tar.gz       # Extract gzip

# zip
zip -r archive.zip dir/         # Create
unzip archive.zip              # Extract

# 7z
7z a archive.7z dir/           # Create
7z x archive.7z                # Extract
```

## System Info

```bash
# System
uname -a            # All system info
uname -r            # Kernel version
hostname            # Hostname
whoami              # Current user
uptime              # System uptime
date                # Current date/time

# Hardware
lscpu               # CPU info
lsmem               # Memory info
lsblk               # Block devices
lsusb               # USB devices
lspci               # PCI devices

# Resources
free -h             # Memory usage
vmstat 1            # System stats (1s interval)
iostat              # I/O statistics
```

## Package Management

### Debian/Ubuntu

```bash
apt update                 # Update package lists
apt upgrade                # Upgrade packages
apt install <pkg>          # Install package
apt remove <pkg>           # Remove package
apt search <term>          # Search packages
apt list --installed      # List installed
dpkg -l                   # List all packages
```

### RHEL/CentOS/Fedora

```bash
yum install <pkg>         # Install package
yum remove <pkg>          # Remove package
yum search <term>         # Search packages
yum list installed        # List installed
dnf install <pkg>         # Fedora alternative
```

### Arch Linux

```bash
pacman -S <pkg>           # Install package
pacman -R <pkg>           # Remove package
pacman -Ss <term>         # Search
pacman -Q                 # List installed
```

## Vi/Vim Basics

```bash
# Modes
i           # Insert mode
Esc         # Normal mode
:           # Command mode

# Navigation
h j k l     # Left down up right
w           # Next word
b           # Previous word
0           # Start of line
$           # End of line
gg          # Start of file
G           # End of file
:n          # Go to line n

# Editing
x           # Delete character
dd          # Delete line
dw          # Delete word
yy          # Copy line
p           # Paste
u           # Undo
ctrl+r      # Redo

# Search
/pattern    # Search forward
?pattern    # Search backward
n           # Next match
N           # Previous match

# Save/Exit
:w          # Save
:q          # Quit
:wq         # Save and quit
:q!         # Quit without saving
```