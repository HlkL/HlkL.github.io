![](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1694616349-v2-3dcea486411d1c92d05eaebca9279cd3_1440w.awebp)

**[kafka](https://github.com/apache/kafka)安装和配置**

**kafka** 对于 [**zookeeper**](https://github.com/apache/zookeeper) 是强依赖，保存 **kafka** 相关的节点数据，安装 **kafka** 之前必须先安装 **zookeeper**。

- **docker** 安装 zookeeper

  ```shell
  docker pull zookeeper:3.7
  ```

- 运行

  ```shell
  docker run -d --name zookeeper \
   -p 2181:2181 \
   -e TZ="Asia/Shanghai" \
   -v $PWD/zookeeper/data:/data \
   --restart always \
   zookeeper:3.7
  ```

- docker 安装 kafka

  ```shell
  docker pull wurstmeister/kafka:2.13-2.8.1
  ```

- 运行

  ```shell
  docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_BROKER_ID=0 \
  -e KAFKA_ZOOKEEPER_CONNECT=42.139.46.62:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://42.139.46.62:9092 \
  -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 \
  -e KAFKA_HEAP_OPTS="-Xmx256M -Xms256M" \
  -e TZ="Asia/Shanghai" \
  wurstmeister/kafka:2.13-2.8.1
  ```

| **变量**                   | **描述**                                        |
| :------------------------- | ----------------------------------------------- |
| KAFKA_BROKER_ID            | kafka集群中每个kafka都有一个BROKER_ID来区分自己 |
| KAFKA_ADVERTISED_LISTENERS | kafka的地址和端口，用于向zookeeper注册          |
| KAFKA_ZOOKEEPER_CONNECT    | zookeeper地址                                   |
| KAFKA_LISTENERS            | kafka监听端口                                   |
| KAFKA_HEAP_OPTS            | java运行内存设置                                |
| TZ                         | 容器时区                                        |

docker-compose部署

```yaml
version: '3.5'
services:
  zookeeper:
    image: wurstmeister/zookeeper   ## 镜像
    container_name: zookeeper
    ports:
      - "2181:2181"                 ## 对外暴露的端口号
  kafka:
    image: wurstmeister/kafka       ## 镜像
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 43.139.96.22         ## 修改:宿主机IP
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181       ## 卡夫卡运行是基于zookeeper的
      KAFKA_ADVERTISED_PORT: 9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://43.139.96.22:9092
      KAFKA_LISTENERS=PLAINTEXT: //0.0.0.0:9092
      KAFKA_LOG_RETENTION_HOURS: 120
      KAFKA_MESSAGE_MAX_BYTES: 10000000
      KAFKA_REPLICA_FETCH_MAX_BYTES: 10000000
      KAFKA_GROUP_MAX_SESSION_TIMEOUT_MS: 60000
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_DELETE_RETENTION_MS: 1000
      KAFKA_HEAP_OPTS: "-Xmx256M -Xms256M"
```

