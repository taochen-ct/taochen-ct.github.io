# YARN 架构与核心组件详解

在 **Hadoop YARN** 中，最容易混淆的就是各种缩写。理解它们之间的关系后，Spark on YARN 的运行流程就很清晰了。

## YARN 整体架构

```text
+----------------------+
|        Client        |
+----------+-----------+
           |
           | 提交 Spark Job
           v
+----------------------+
| ResourceManager (RM) |
+----------+-----------+
           |
           | 分配一个 Container 给 AM
           v
+-------------------------------+
| ApplicationMaster (AM)        |
| Spark Driver (Cluster 模式)   |
+---------------+---------------+
                |
                | 向 RM 申请 Executor
                v
+----------------------+
| ResourceManager (RM) |
+----------+-----------+
           |
           | 分配多个 Container
           |
   +-------+-----------------------+
   |                               |
   v                               v
+----------------------+   +----------------------+
| NodeManager (NM)     |   | NodeManager (NM)     |
| Container            |   | Container            |
| Spark Executor       |   | Spark Executor       |
+----------------------+   +----------------------+
```

## RM（ResourceManager）

RM 是 **整个 YARN 集群的资源管理中心**。

职责：

- 接收应用提交
- 管理整个集群资源
- 调度资源
- 分配 Container
- 记录 Application 状态

可以理解成：

> 整个集群的「总调度员」

常见 REST：

```text
/ws/v1/cluster/apps
/ws/v1/cluster/nodes
/ws/v1/cluster/metrics
```

默认端口：

```text
8088
```

## NM（NodeManager）

每台机器都有一个 NM。

例如：

```text
worker01
worker02
worker03
```

每台都会运行：

```text
NodeManager
```

职责：

- 启动 Container
- 杀死 Container
- 收集日志
- 汇报资源给 RM

可以理解成：

> 每台机器的管家

默认端口：

```text
8042
```

## AM（ApplicationMaster）

每个 Application 都会有一个 AM。

例如：

```text
Spark Job A -> AM1
Spark Job B -> AM2
```

AM 生命周期：

```text
Job 开始
  ↓
启动 AM
  ↓
申请 Executor
  ↓
监控任务
  ↓
Job 结束
  ↓
AM 退出
```

所以：

> 一个 Job 一个 AM。

## Container

Container 不是 Docker。

它只是：

> YARN 分配的一块资源

例如：

```text
4 Core
8 GB
```

就是一个 Container。

里面可以运行：

- AM
- Spark Executor
- Map Task
- Reduce Task

Container ID 示例：

```text
container_1751518713616_0001_01_000003
```

## Spark Driver

很多人把 Driver 和 AM 搞混。

其实要区分部署模式。

### YARN Client 模式

```text
你的机器
  |
Driver
  |
  v
RM
```

Driver 不在集群中，而是在提交任务的客户端机器上。

### YARN Cluster 模式

```text
RM
 |
 v
AM
 |
Driver
```

Driver 运行在 AM 里面。

所以在 Cluster 模式下：

```text
AM == Driver
```

这也是为什么 Driver 日志通常就是 AM 日志。

## Executor

Executor 是执行 Task 的 JVM 进程。

```text
Driver
  |
  +-- Executor1
  +-- Executor2
  +-- Executor3
```

负责：

- 执行 Task
- Cache 数据
- Shuffle

## Task

Task 是 Spark 的最小执行单位。

例如：

```text
100 个 Partition
```

就会产生：

```text
100 个 Task
```

Task 运行在 Executor 里面。

## Application

Application 就是一次应用提交。

在 Spark 场景下，通常对应一次：

```bash
spark-submit
```

例如：

```text
application_1751518713616_0015
```

整个生命周期：

```text
提交 -> 运行 -> 结束
```

## AppAttempt

Application 失败可以重试。

例如：

```text
Application
  ├── Attempt1
  └── Attempt2
```

Attempt1 失败后，RM 可以重新启动 Attempt2。

## History Server

简称 HS。

职责是保存并展示 Spark 历史任务信息：

- Spark UI
- DAG
- SQL
- Stage
- Executor 信息

默认端口：

```text
19888
```

## Timeline Server

简称 ATS，全称 Application Timeline Server。

用于保存 Application 生命周期和历史信息。

很多公司会关闭它，因为比较占资源。

## Log Aggregation

Log Aggregation 不是一个独立进程，而是一套日志聚合机制：

```text
NodeManager
  |
  | 上传日志
  v
HDFS
```

作用：

```text
Job 结束
stdout / stderr
  ↓
上传 HDFS
```

然后通过下面的命令读取：

```bash
yarn logs -applicationId <application_id>
```

## 这些组件之间的关系

```text
Spark Client
   |
   | spark-submit
   v
ResourceManager (RM)
   |
   | 分配 Container 启动 AM
   v
ApplicationMaster (AM)
Cluster 模式下包含 Spark Driver
   |
   | 向 RM 申请 Executor Container
   |
   +---------------------------+
   |                           |
   v                           v
NodeManager (NM)          NodeManager (NM)
   |                           |
Container                  Container
   |                           |
Spark Executor             Spark Executor
   |                           |
Task                       Task
```

## 常见缩写速查表

| 缩写 | 全称 | 作用 |
| --- | --- | --- |
| RM | ResourceManager | 全集群资源调度器 |
| NM | NodeManager | 每台节点上的资源和容器管理器 |
| AM | ApplicationMaster | 单个应用的管理者，负责申请资源、协调执行 |
| Driver | Spark Driver | Spark 程序的控制中心；YARN Cluster 模式下运行在 AM 中 |
| Executor | Spark Executor | 执行 Spark Task 的 JVM 进程 |
| Container | YARN Container | YARN 分配的一份 CPU/内存资源，不是 Docker 容器 |
| Application | YARN Application | 一次提交的应用，如一次 `spark-submit` |
| AppAttempt | Application Attempt | 应用的一次尝试，失败可重试 |
| HS | History Server | 展示 Spark 历史任务和 UI |
| ATS | Application Timeline Server | 保存应用生命周期和历史信息，可选 |
| HDFS | Hadoop Distributed File System | Hadoop 分布式文件系统，日志聚合常存放于此 |

理解这些角色后，再看 Spark on YARN 的日志、REST API、资源申请等流程就会容易得多，因为每个组件都有明确的职责和边界。
