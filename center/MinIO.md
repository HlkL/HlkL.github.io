docker 部署minio

```shell
docker run -p 9001:9000 -p 46357:46357 -d --name minio \
-e "MINIO_ROOT_USER=hougen" \
-e "MINIO_ROOT_PASSWORD=password" \
-v $PWD/minio/data:/data \
-v $PWD/minio/config:/root/.minio \
minio/minio server /data \
--console-address '0.0.0.0:46357'
```

> `-e` 参数配置 MinIO 控制台登陆账号及密码
>
>  ﻿`--console-address '0.0.0.0:46357'` 参数的作用是设置 MinIO 控制台的监听地址和端口。﻿0.0.0.0 表示监听所有网卡，﻿46357 是端口号



依赖导入

```yaml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.4</version>
    <!-- 依赖冲突解决-->
    <exclusions>
        <exclusion>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.9.0</version>
</dependency>
```

配置属性读取

```java
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioProp {
    /**
     * 连接url
     */
    private String endpoint;
    /**
     * 用户名
     */
    private String accessKey;
    /**
     * 密码
     */
    private String secretKey;
    /**
     * bucket
     */
    private String bucket;
}
```

客户端配置

```java
@Configuration
@EnableConfigurationProperties(MinioProp.class)
public class MinioConfig {

    private MinioProp minioProp;

    @Autowired
    public void setMinioProp(MinioProp minioProp) {
        this.minioProp = minioProp;
    }

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .credentials(minioProp.getAccessKey(), minioProp.getSecretKey())
                .endpoint(minioProp.getEndpoint())
                .build();
    }
}
```

本地文件指定上传

```java
@Test
void minioLocalFileUploadTest() throws Exception {
    String bucket = "learn";
    String url = "http://localhost:9001";

    String filename = "60fb3a499a7b55f1658f2c4c72cc2bc1.jpeg";
    String filePath = "/Users/hougen/Pictures/60fb3a499a7b55f1658f2c4c72cc2bc1.jpeg";
    FileInputStream inputStream = new FileInputStream(filePath);

    // 上传文件
    PutObjectArgs objectArgs = PutObjectArgs.builder()
            .object(filename)
            // 内容类型
            .contentType("image/jpeg")
            .bucket(bucket)
            .stream(inputStream, inputStream.available(), -1)
            .build();
    minioClient.putObject(objectArgs);

    // 访问路径
    log.info(url + "/" + bucket + "/" + filename);
}

```

> [内容类型](https://blog.csdn.net/qq_36551991/article/details/109499487)

文件上传接口测试

```java
  public String fileUpload(MultipartFile file) {
      if (file.isEmpty()) {
          return "";
      }
      try {
          String filename = Optional.ofNullable(file.getOriginalFilename())
                  .map(originalFilename ->
                          minioProp.getBucket() + System.currentTimeMillis()
                                  + originalFilename.substring(originalFilename.lastIndexOf(DELIMITER))
                  ).orElseThrow();

          PutObjectArgs objectArgs = buildPutObjectArgs(file, filename);
          minioClient.putObject(objectArgs);
          return this.generateFileRequestUrl(minioProp.getBucket(), filename, Method.GET, null);
      } catch (Exception e) {
          log.error(e.getMessage());
      }
      return "";
  }
```





