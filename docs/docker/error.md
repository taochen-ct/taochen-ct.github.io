# Docker容器启动相关错误排查和处理

### 1. docker0: iptables: No chain/target/match by that name问题解决

问题原因：重新修改防火墙，重新启动防火墙导致iptable出问题

排查方法：

```bash
# check iptable
iptables -L -n

# is br_netfilter normal
lsmod | grep br_netfilter
```

问题解决：

重新启动docker服务

```bash
# method 1 (common)
systemctl restart docker

# method 2 (offline or run dockerd by nohup)
ps -ef | grep dockerd
kill -9 <PID>
nohup dockerd > dockerd.txt 2>&1 &
```

### 2. docker加载镜像报错No space left device

问题原因：docker根目录内存空间不足
排查方法：
	1. df -h  查看系统盘空间
	2. docker info 查看docker容器根目录
	3. df -hl <data-root：docker根路径>
 问题解决：
	 1. 修改 /etc/docker/daemon.json 更改docker根路径指向
	 2. 重新启动dockerd服务
>  dockerd服务还未启动时就修改date-root路径，防止以上问题

### 3. 容器内服务启动线程无权限

问题原因：容器内进程权限不够
排查方法：查看容器启动日志
问题解决： 
	1. 使用docker-compose启动：在启动yml文件中对应容器增加 `privileged: true`选项
	2. docker直接启动增加 `--privileged=true`  参数