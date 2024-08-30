- Nginx 

  ```
  docker run -p 8080:80 --name nginx -v /home/nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /home/nginx/conf/conf.d:/etc/nginx/conf.d -v /home/nginx/log:/var/log/nginx -v /home/nginx/html:/user/share/nginx/html -d nginx
  ```

- Jenkins 

  ```
  docker run -d -uroot -p 9095:8080 -p 50000:50000 --name jenkins -v /home/jenkins_home:/var/jenkins_home -v /etc/localtime:/etc/localtime jenkins/jenkins
  ```

- Mysql 

  ```
  docker run \
  -p 3306:3306 \
  --name mysql \
  --privileged=true \
  --restart unless-stopped \
  -v /mnt/sda1/mysql8.0.20/mysql:/etc/mysql \
  -v /mnt/sda1/mysql8.0.20/logs:/logs \
  -v /mnt/sda1/mysql8.0.20/data:/var/lib/mysql \
  -v /etc/localtime:/etc/localtime \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -d
  ```

- Minio 

  ```
  docker mino
  docker run -p 9000:9000 -p 9090:9090      
  --net=host   --name minio     
  -d  --restart=always     
  -e "MINIO_ACCESS_KEY=minioadmin"  
  -e "MINIO_SECRET_KEY=minioadmin"     
  -v /root/minio/data:/data      
  -v /root/minio/config:/root/.minio      
  minio/minio server      
  /data --console-address ":9090" -address ":9000"
  ```

- Rabbit MQ

  ```
  docker rabbitmq
  镜像
  docker pull rabbitmq:management
  创建数据持久卷
  docker volume create rabbitmq-home
  创建运行容器
  docker run -id --name=rabbitmq -v rabbitmq-home:/var/lib/rabbitmq \
  -p 15672:15672 -p 5672:5672 \
  -e RABBITMQ_DEFAULT_USER=rabbitmq \
  -e RABBITMQ_DEFAULT_PASS=123456 rabbitmq:management
  ```

- Redis 

  ```
  docker run -p 6379:6379 --name redis -v /home/redis/redis.conf:/etc/redis/redis.conf -v /home/redis/data:/data -d redis redis-server /etc/redis/redis.conf --appendonly yes
  ```

- Gitlab

  ```
  docker run --detach    --hostname  gitlab    --publish 10443:443     --publish  17080:80     --publish  12222:22    --privileged=true     --name gitlab    --restart always    --volume /d/gitlab/config:/etc/gitlab    --volume /d/gitlab/logs:/var/log/gitlab    --volume /d/gitlab/data:/var/opt/gitlab    --volume  /d/gitlab/logs/reconfigure:/var/log/gitlab/reconfigure    gitlab/gitlab-ce
  
  
  vim /mnt/d/gitlab/config/gitlab.rb
  
  #配置http协议所使用的访问地址,不加端口号默认为80
  external_url 'http://192.168.1.3'
  # 配置ssh协议所使用的访问地址和端口
  gitlab_rails['gitlab_ssh_host'] = '192.168.1.3'
  # 此端口是run时22端口映射的2222端口
  gitlab_rails['gitlab_shell_ssh_port'] = 12222 
  
  ```


- 日志文件位置

  ```shell
  docker inspect --format='\{\{.LogPath\}\}' <容器ID>
  ```

- 清空日志文件

  ```ruby
  echo "" > $(docker inspect --format='\{\{\.LogPath\}\}' <容器ID>)
  ```
