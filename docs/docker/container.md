---
prev:
    link: '/docker'
    text: 'Overview'
next:
    link: '/docker/error'
    text: 'Error'
---



# Docker 启动容器

### Neo4j
```shell
# docker run neo4j
docker run -d --name  neo4j-test -p 7474:7474 -p 7687:7687 -v /data01/neo4j-volumn/data:/data  -v /data01/neo4j-volumn/logs:/logs  -v /data01/neo4j-volumn/conf:/var/lib/neo4j/conf -v /data01/neo4j-volumn/import:/var/lib/neo4j/import  --env NEO4J_AUTH=neo4j/Pass1234 --env=NEO4J_ACCEPT_LICENSE_AGREEMENT=yes  neo4j:4.4.3-enterprise
```

### MySQL

```shell
# docker run mysql
docker run --name mysql-container \
	-p 8306:3306 \
  -e MYSQL_ROOT_PASSWORD=<your root password> \
  -e MYSQL_DATABASE=<database name> \
  -e MYSQL_USER=<your user name> \
  -e MYSQL_PASSWORD=<your user password> \
  -v /root/nfs_data/mysql-data:/var/lib/mysql \
  -d hub.atomgit.com/amd64/mysql:5.7.43

  ```


### Nginx
```shell
docker run -p 8080:80 --name nginx -v /home/nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /home/nginx/conf/conf.d:/etc/nginx/conf.d -v /home/nginx/log:/var/log/nginx -v /home/nginx/html:/user/share/nginx/html -d nginx
```
### Jenkins
```shell
docker run -d -uroot -p 9095:8080 -p 50000:50000 --name jenkins -v /home/jenkins_home:/var/jenkins_home -v /etc/localtime:/etc/localtime jenkins/jenkins
```

### Minio
```shell
docker run -p 9000:9000 -p 9090:9090      
  --net=host   --name minio     
  -d  --restart=always     
  -e "MINIO_ACCESS_KEY=<your access key>"  
  -e "MINIO_SECRET_KEY=<your secret key>"     
  -v /root/minio/data:/data      
  -v /root/minio/config:/root/.minio      
  minio/minio server      
  /data --console-address ":9090" -address ":9000"
```

### Rabbit MQ
```shell
# images
docker pull rabbitmq:management
# 创建数据持久卷
docker volume create rabbitmq-home
# 创建运行容器
docker run -id --name=rabbitmq -v rabbitmq-home:/var/lib/rabbitmq \
  -p 15672:15672 -p 5672:5672 \
  -e RABBITMQ_DEFAULT_USER=rabbitmq \
  -e RABBITMQ_DEFAULT_PASS=123456 rabbitmq:management
```

### Redis
```shell
docker run -p 6379:6379 --name redis -v /home/redis/redis.conf:/etc/redis/redis.conf -v /home/redis/data:/data -d redis redis-server /etc/redis/redis.conf --appendonly yes
```
### Gitlab
```shell
docker run --detach --hostname  gitlab \
--publish 443:443     \
--publish  80:80     \
--publish  22:22    \
--privileged=true     \
--name gitlab    \
--restart always    \
--volume /d/gitlab/config:/etc/gitlab    \
--volume /d/gitlab/logs:/var/log/gitlab   \ 
--volume /d/gitlab/data:/var/opt/gitlab   \ 
--volume  /d/gitlab/logs/reconfigure:/var/log/gitlab/reconfigure  \  gitlab/gitlab-ce
```