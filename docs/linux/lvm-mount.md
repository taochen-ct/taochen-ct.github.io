---
title: Disk & LVM Mount
prev:
    link: '/linux/systemd'
    text: 'Systemd'
next:
    link: '/linux/commands'
    text: 'Basic Commands'
---

# Linux Disk & LVM Mount

## 1. 查看磁盘信息

```bash
# 列出块设备（最直观，树形结构）
lsblk

# 详细信息（设备、容量、扇区、型号）
fdisk -l

# 查看文件系统/挂载/类型
df -h
df -hT

# 查看挂载关系
mount | grep sdb
findmnt /data

# 查看 LVM 卷组/逻辑卷
pvs            # Physical Volume
vgs            # Volume Group
lvs            # Logical Volume
```

## 2. LVM 整体流程

LVM 三层结构：

```
Physical Disk  /dev/sdb /dev/sdc        ← 物理磁盘
        ↓ pvcreate
Physical Volume (PV)                     ← 物理卷
        ↓ vgcreate
Volume Group (VG)   my_vg                ← 卷组（池）
        ↓ lvcreate
Logical Volume (LV)   /dev/my_vg/my_lv   ← 逻辑卷（可格式化）
        ↓ mkfs
Filesystem            ext4               ← 文件系统
        ↓ mount
Mount Point           /data              ← 挂载点
```

完整流程（适用于新增多块磁盘）：

```bash
# Step 1：创建物理卷（PV）
pvcreate /dev/sdb /dev/sdc

# Step 2：创建卷组（VG），把多块盘合并成一个池
vgcreate my_vg /dev/sdb /dev/sdc

# Step 3：创建逻辑卷（LV），从池里切出一块
lvcreate -l 100%FREE -n my_lv my_vg

# Step 4：格式化
mkfs.ext4 /dev/my_vg/my_lv

# Step 5：挂载
mkdir -p /data
mount /dev/my_vg/my_lv /data

# Step 6：验证
df -h /data
```

## 3. 开机自动挂载（/etc/fstab）

```bash
# 推荐：用 UUID 标识，避免设备名漂移
blkid /dev/my_vg/my_lv
# /dev/my_vg/my_lv: UUID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" TYPE="ext4"

vim /etc/fstab
```

```fstab
# <device>                            <mount>  <type> <options> <dump> <pass>
UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxx...  /data    ext4   defaults    0      0
```

字段说明：

| 字段 | 含义 |
|---|---|
| `<device>` | 设备路径（`/dev/sda1`）或 UUID（推荐） |
| `<mount>` | 挂载点目录 |
| `<type>` | 文件系统类型：`ext4`、`xfs`、`btrfs`、`swap`、`nfs` |
| `<options>` | 挂载选项，常用 `defaults`（= `rw,suid,dev,exec,auto,nouser,async`） |
| `<dump>` | 是否被 `dump` 备份：`0` 忽略，`1` 启用 |
| `<pass>` | `fsck` 检查顺序：`0` 不检查，`1` 根，`2` 其他 |

> ⚠️ 设备名（`/dev/sdb`）**不可靠**：重启或插拔后可能漂移到 `sdc`、`sdd`。生产环境**务必用 UUID 或 LABEL**。

```bash
# 验证 fstab 是否正确（不会真挂载，只解析）
mount -a
# 或：
findmnt --verify
```

## 4. 扩容（在线扩展）

新增一块盘 `/dev/sdd`，把空间并入已有卷组，再扩逻辑卷。

```bash
# Step 1：新建 PV 并加入已有 VG
vgextend my_vg /dev/sdd
vgs            # 确认 VFree 增加

# Step 2：扩展 LV，占满所有剩余空间
lvextend -l +100%FREE /dev/my_vg/my_lv

# Step 3：让文件系统识别新容量（ext4）
resize2fs /dev/my_vg/my_lv

# XFS 文件系统用：
# xfs_growfs /data

# Step 4：验证
df -h /data
```

> ✅ `lvextend + resize2fs` 在 ext4 上**支持在线扩容**（不需要 unmount）。XFS 用 `xfs_growfs`，必须挂载在目标上。

## 5. 常用运维命令速查

```bash
# 信息查看
pvs / vgs / lvs          # 三层状态概览
pvdisplay / vgdisplay / lvdisplay   # 详细
pvscan / vgscan / lvscan           # 扫描

# 删除（从下到上，逐级拆解）
umount /data
lvremove /dev/my_vg/my_lv
vgremove my_vg
pvremove /dev/sdb /dev/sdc

# 缩减 LV（ext4 不支持在线缩容，必须先缩 fs 再缩 lv）
resize2fs /dev/my_vg/my_lv 100G
lvreduce -L 100G /dev/my_vg/my_lv

# 数据迁移（用 pvmove 把数据从一块坏盘挪走）
pvmove /dev/sdb
```

## 6. 故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `mount: unknown filesystem type 'LVM2_member'` | 内核未加载 `dm_mod` | `modprobe dm_mod`；检查 `/etc/lvm/lvm.conf` |
| `device-mapper: reload ioctl failed` | LV 元数据损坏 | `vgcfgrestore my_vg` |
| 开机卡在 `Welcome to emergency mode` | `/etc/fstab` 写错 | 用 root 密码进 emergency，注释错误行，`mount -a` 验证 |
| `resize2fs: Device or resource busy` | LV 仍在被使用 | 先 `umount`（或在挂载点跑 `resize2fs`） |
| 新盘 `fdisk -l` 看不到 | 硬盘未插好 / RAID 卡未识别 | 重扫 SCSI：`echo 1 > /sys/block/sda/device/rescan` |
| `pvcreate: Device /dev/sdb not found` | 多路径名变化 | 用 `ls -l /dev/disk/by-id/` 或 `by-uuid` 找稳定名 |

## 7. 速查表

| 操作 | 命令 |
|---|---|
| 创建 PV | `pvcreate /dev/sdb` |
| 创建 VG | `vgcreate my_vg /dev/sdb` |
| 创建 LV（按全部空间） | `lvcreate -l 100%FREE -n my_lv my_vg` |
| 创建 LV（按大小） | `lvcreate -L 100G -n my_lv my_vg` |
| 格式化 ext4 | `mkfs.ext4 /dev/my_vg/my_lv` |
| 临时挂载 | `mount /dev/my_vg/my_lv /data` |
| 永久挂载 | 写 `/etc/fstab`（用 UUID） |
| VG 扩容 | `vgextend my_vg /dev/sdd` |
| LV 扩容 | `lvextend -l +100%FREE /dev/my_vg/my_lv` |
| 文件系统扩容（ext4） | `resize2fs /dev/my_vg/my_lv` |
| 文件系统扩容（XFS） | `xfs_growfs /data` |
| 查看 UUID | `blkid /dev/my_vg/my_lv` |
| 验证 fstab | `mount -a` / `findmnt --verify` |