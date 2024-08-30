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



 