---
title: RustFS Distributed Cluster
prev:
    link: '/docker/compose'
    text: 'Docker Compose'
next: false
---

# RustFS 多节点分布式高可用部署最佳实践

本文档提供基于 **4 节点 × 4 磁盘（共 16 驱动器）** 的生产级 RustFS 分布式集群部署方案。该架构基于纠删码（Erasure Coding）与去中心化设计，支持**高并发读写**与**节点/磁盘级容错**。

---

## 零、架构与容错设计说明

### 1. 节点与磁盘拓扑

* **节点数量**：4 台物理机/虚拟机（`192.168.1.101` ~ `104`）
* **每节点磁盘**：4 块独立物理硬盘（挂载至 `/data/rustfs0` ~ `/data/rustfs3`）
* **总驱动器数**：16 驱动器（Drives）

### 2. 高可用性与容错矩阵

| 故障场景 | 读数据（Read） | 写数据（Write） | 状态说明 |
| --- | --- | --- | --- |
| **损坏 1-4 块硬盘 / 宕机 1 台节点** | **正常** | **正常** | 业务无感知，纠删码实时修复数据 |
| **同时宕机 2 台节点** | **正常** | **正常** | 依然满足法定人数（Quorum ≥ 9） |
| **同时宕机 3 台节点** | 锁定 | 拒绝 | 保证数据一致性，防止数据损坏 |

---

## 一、环境准备（所有 4 个节点均需执行）

### 1. 硬件磁盘挂载（推荐）

为保证极致 IO 性能与硬件隔离容错，建议将 4 块物理磁盘分别挂载到指定目录：

```bash
# 创建数据挂载点
sudo mkdir -p /data/rustfs0 /data/rustfs1 /data/rustfs2 /data/rustfs3

# (可选) 挂载独立硬盘示例 (写进 /etc/fstab)
# /dev/sdb /data/rustfs0 xfs defaults,noatime 0 0
# /dev/sdc /data/rustfs1 xfs defaults,noatime 0 0
# /dev/sdd /data/rustfs2 xfs defaults,noatime 0 0
# /dev/sde /data/rustfs3 xfs defaults,noatime 0 0
```

### 2. 网络与防火墙配置

#### 方案 A：通过 `/etc/hosts` 绑定别名（推荐，易扩展）

在 **所有 4 台机器** 的 `/etc/hosts` 中添加：

```text
192.168.1.101 node1
192.168.1.102 node2
192.168.1.103 node3
192.168.1.104 node4
```

#### 方案 B：裸 IP 部署（无需配置 hosts）

* 若 IP 连续（如 `101...104`）：直接在变量中使用 `192.168.1.{101...104}` 展开语法。
* 若 IP 不连续：采用空格分隔全量 IP 列表。

#### 放行服务端口

```bash
# 开放 S3 API 端口(9000) 与 Console 控制台端口(9001)
sudo firewall-cmd --zone=public --add-port=9000/tcp --permanent
sudo firewall-cmd --zone=public --add-port=9001/tcp --permanent
sudo firewall-cmd --reload
```

---

## 二、集群部署步骤

集群中所有节点运行的启动参数**完全相同**。RustFS 会自动通过主机网络识别本机 Identity 并建立集群通信。

### 1. 编写部署脚本 `deploy-rustfs.sh`

在 **所有节点** 创建并运行以下脚本：

#### 选项 A：使用域名/主机名方式（需完成 Hosts 配置）

```bash
#!/bin/bash

# 设置超级管理员密钥（生产环境请务必修改为强密码）
ACCESS_KEY="admin_prod_access_key"
SECRET_KEY="SuperStrongSecretKey2026!"

docker run -d \
 --name rustfs \
 --restart always \
 --network host \
 -v /data:/data \
 -e RUSTFS_ACCESS_KEY="${ACCESS_KEY}" \
 -e RUSTFS_SECRET_KEY="${SECRET_KEY}" \
 -e RUSTFS_CONSOLE_ENABLE=true \
 -e RUSTFS_VOLUMES="http://node{1...4}:9000/data/rustfs{0...3}" \
 rustfs/rustfs:latest
```

#### 选项 B：使用裸 IP 方式（免配置 Hosts，IP 连续）

```bash
#!/bin/bash

ACCESS_KEY="admin_prod_access_key"
SECRET_KEY="SuperStrongSecretKey2026!"

docker run -d \
 --name rustfs \
 --restart always \
 --network host \
 -v /data:/data \
 -e RUSTFS_ACCESS_KEY="${ACCESS_KEY}" \
 -e RUSTFS_SECRET_KEY="${SECRET_KEY}" \
 -e RUSTFS_CONSOLE_ENABLE=true \
 -e RUSTFS_VOLUMES="http://192.168.1.{101...104}:9000/data/rustfs{0...3}" \
 rustfs/rustfs:latest
```

### 2. 依次启动与初始化集群

在 4 个节点上分别执行上述启动脚本：

```bash
chmod +x deploy-rustfs.sh
./deploy-rustfs.sh
```

---

## 三、集群验证与管理

### 1. 检查日志与握手状态

在任意节点上运行以下命令，验证所有节点是否完成 TCP 握手：

```bash
docker logs -f --tail 100 rustfs
```

> **预期输出**：日志中会列出 16 个 Drive 状态均为 `Online`，并提示控制台及 S3 API 已成功绑定启动。

### 2. 访问 Web 控制台

在浏览器打开任意节点的控制台端口：

* **URL**: <http://192.168.1.101:9001>（或 `102` ~ `104` 均可）
* **Access Key**: `admin_prod_access_key`
* **Secret Key**: `SuperStrongSecretKey2026!`

---

## 四、生产环境增强建议（VIP 统一入口）

直接让客户端连接某单台节点 IP 仍存在单点接入风险。建议使用 **Keepalived** 提供虚拟 IP（VIP），或前置 **Nginx/HAProxy** 实现高可用负载均衡。

```
 ┌───────────────────────────┐
 │ 客户端 / 业务应用 (S3 API) │
 └─────────────┬─────────────┘
               │ http://192.168.1.200:9000 (VIP)
               ▼
 ┌───────────────────────────┐
 │ Keepalived / Nginx 负载均衡│
 └─────────────┬─────────────┘
               │
   ┌───────────┼────────────┬────────────┐
   ▼           ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ RustFS 1 │ │ RustFS 2 │ │ RustFS 3 │ │ RustFS 4 │
│ .101     │ │ .102     │ │ .103     │ │ .104     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Nginx 极简负载均衡示例

```nginx
stream {
 upstream rustfs_s3 {
  server 192.168.1.101:9000 max_fails=3 fail_timeout=5s;
  server 192.168.1.102:9000 max_fails=3 fail_timeout=5s;
  server 192.168.1.103:9000 max_fails=3 fail_timeout=5s;
  server 192.168.1.104:9000 max_fails=3 fail_timeout=5s;
 }

 server {
  listen 9000;
  proxy_pass rustfs_s3;
 }
}
```
