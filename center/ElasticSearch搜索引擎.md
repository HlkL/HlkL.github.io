## ElasticSearch

***elasticsearch是一款非常强大的开源搜索引擎，具备非常多强大功能，可以帮助我们从海量数据中快速找到需要的内容,elasticsearch结合kibana、Logstash、Beats，也就是elastic stack（ELK）。被广泛应用在日志数据分析、实时监控等领域,而elasticsearch是elastic stack的核心，负责存储、搜索、分析数据***

![image-20221230172857418](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675893-fe9be7f97422ec1acc7140c61793ec476950a077.png)

**正向索引**

**正向索引**是最传统的，根据id索引的方式。但根据词条查询时，必须先逐条获取每个文档，然后判断文档中是否包含所需要的词条，是**根据文档找词条的过程**

![image-20221230173440160](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675904-da2d578766f85cb2ca660bd2ce27dbea4355a31e.png)

> - 优点：
>   - 可以给多个字段创建索引
>   - 根据索引字段搜索、排序速度非常快
> - 缺点：
>   - 根据非索引字段，或者索引字段中的部分词条查找时，只能全表扫描

**倒排索引**

**倒排索引**是先找到用户要搜索的词条，根据词条得到保护词条的文档的id，然后根据id获取文档。是**根据词条找文档的过程**

![image-20221230173641790](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675912-98392f5071381d9b7b8ad1fb937c27f38547a91d.png)

**倒排索引**是对正向索引的一种特殊处理

- 将每一个文档的数据利用算法分词，得到一个个词条
- 创建表，每行数据包括词条、词条所在文档id、位置等信息
- 因为词条唯一性，可以给词条创建索引，例如hash表结构索引

> - 优点：
>   - 根据词条搜索、模糊搜索时，速度非常快
> - 缺点：
>   - 只能给词条创建索引，而不是字段
>   - 无法根据字段做排序

==文档和字段==

`elasticsearch`是面向**文档（Document）**存储的，可以是数据库中的一条商品数据，一个订单信息。文档数据会被序列化为json格式后存储在`elasticsearch`中,而Json文档中往往包含很多的**字段（Field）**，类似于数据库中的列

![image-20221230174241480](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675916-d604599bf5088c6a67d7992878977ffbabbeeae4.png)

==索引和映射==

- **索引（Index）**就是相同类型的文档的集合,可以把索引当做是数据库中的表
- **映射（mapping）**是索引中文档的字段约束信息，类似表的结构约束

![image-20221230174739730](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675920-15b48662ec74719e2b5cea8182bae00a924da347.png)

==mysql与elasticsearch==


| **MySQL** | **Elasticsearch** | **说明**                                                                          |
| :---------: | :-----------------: | :---------------------------------------------------------------------------------- |
|   Table   |       Index       | 索引(index)，就是文档的集合，类似数据库的表(table)                                |
|    Row    |     Document     | 文档（Document），就是一条条的数据，类似数据库中的行（Row），文档都是JSON格式     |
|  Column  |       Field       | 字段（Field），就是JSON文档中的字段，类似数据库中的列（Column）                   |
|  Schema  |      Mapping      | Mapping（映射）是索引中文档的约束，例如字段类型约束。类似数据库的表结构（Schema） |
|    SQL    |        DSL        | DSL是elasticsearch提供的JSON风格的请求语句，用来操作elasticsearch，实现CRUD       |

- **Mysql**  擅长事务类型操作，可以确保数据的安全和一致性
- **Elasticsearch**  擅长海量数据的搜索、分析、计算

![image-20221230175204724](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675926-4c43a4e7ee0951c2827ea0e43a3461dc9c2edb50.png)

> - **文档**  一条数据就是一个文档，es中是Json格式
> - **字段**   Json文档中的字段
> - **索引**  同类型文档的集合
> - **映射**  索引中文档的约束，比如字段名称、类型

## elasticsearch,kibana安装

==:star:elasticsearch 8.x版本首次运行会生成kibana需要的验证码==

```sh
docker pull elasticsearch:7.17.7
docker pull kibana:7.17.7
```

创建一个网络让es和kibana容器互联

```sh
docker network create es-net
```

es数据卷挂载需要设置权限

```sh
sudo chown 1000:1000 <directory you wish to mount> 
```

启动elasticsearch

```sh
docker run -d --name es \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -e "discovery.type=single-node" \
    -v $PWD/es-data:/usr/share/elasticsearch/data \
    -v $PWD/es-plugins:/usr/share/elasticsearch/plugins \
    --privileged \
    --network es-net \
    -p 9200:9200 \
    -p 9300:9300 \
elasticsearch:7.17.7
```

> - `-e "cluster.name=es-docker-cluster"`：设置集群名称
> - `-e "http.host=0.0.0.0"`：监听的地址，可以外网访问
> - `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`：内存大小
> - `-e "discovery.type=single-node"`：非集群模式
> - `-v es-data:/usr/share/elasticsearch/data`：挂载逻辑卷，绑定es的数据目录
> - `-v es-logs:/usr/share/elasticsearch/logs`：挂载逻辑卷，绑定es的日志目录
> - `-v es-plugins:/usr/share/elasticsearch/plugins`：挂载逻辑卷，绑定es的插件目录
> - `--privileged`：授予逻辑卷访问权
> - `--network es-net` ：加入一个名为es-net的网络中
> - `-p 9200:9200`：端口映射配置

启动kibana

```sh
docker run -d --name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:7.17.7
```

> - `--network es-net` ：加入一个名为es-net的网络中，与elasticsearch在同一个网络中
> - `-e ELASTICSEARCH_HOSTS=http://es:9200"`：设置elasticsearch的地址，因为kibana已经与elasticsearch在一个网络，因此可以用容器名直接访问elasticsearch
> - `-p 5601:5601`：端口映射配置

## 分词器

**es在创建倒排索引时需要对文档分词;在搜索时，需要对用户输入内容分词。但默认的分词规则对中文处理并不友好,处理中文分词一般会使用[IK分词器](https://github.com/medcl/elasticsearch-analysis-ik),IK分词器包含两种模式**

- **ik_smart**  智能切分，粗粒度
- **ik_max_word**  最细切分，细粒度

### 安装分词器

**在线安装**

```sh
# 进入容器内部
docker exec -it elasticsearch /bin/bash

# 在线下载并安装
./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.17.7/elasticsearch-analysis-ik-7.17.7.zip

#退出
exit
#重启容器
docker restart elasticsearch
```

**离线安装**

安装插件需要知道elasticsearch的plugins目录位置，而我们用了数据卷挂载，因此需要查看elasticsearch的数据卷目录==ik分词的版本和es的版本要一致==

```sh
docker volume inspect es-plugins
```

将下载好的压缩包解压后上传到数据卷中

**demo**

```json
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "我在湖南化工职业技术学院学习"
}
```

`_analyze`分词

![image-20221230232245367](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675940-5e4df4ab111db15c5c58d14242f02e396deae7c9.png)

`ik_smart`分词

![image-20221230232152626](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675944-0415f28d5e77004b7445eb7b3443f370dbe25c5d.png)

`ik_max_word`分词

![image-20221230232340344](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675948-caff0fc7dcf40fccac156aae5429aa5d17b130fc.png)

**扩展词库**

修改分词器config目录下的`IKAnalyzer.xml`文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">ext.dic</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords"></entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<!-- <entry key="remote_ext_dict">words_location</entry> -->
	<!--用户可以在这里配置远程扩展停止词字典-->
	<!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>
```

在`ext.dic`的文件中添加扩展的词语

在`stopword.dic`文件中禁止的词语

## 索引库操作

**mapping**属性是对索引库中文档的约束,常见的**mapping**属性

- **type**  字段常用数据类型
  - 字符串  `text`(可分词), `keyword`(精确度,不可分词)
  - 数值  `long` `integer` `short` `byte` `double` `float`
  - 布尔  `boolean`
  - 日期  `date`
  - 对象 `object`
- **index**  是否创建索引,默认为true
- **analyzer**  使用哪种分词器
- **properties**  该字段的子字段

**es**中通过**Restful** 请求操作索引库,文档,请求内容用`DSL`语句来表达

**创建索引库**

![image-20221231184747749](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675954-632508f4e60eff7e46da3a204fdf744614f9f866.png)

```json
PUT /user
{
  "mappings": {
    "properties": {
      "info": {
        "type": "text",
        "analyzer": "ik_smart"
      },
      "email": {
        "type": "keyword",
        "index": false
      },
      "name": {
        "type": "object", 
        "properties": {
          "firstName": {
            "type": "keyword"
          },
          "lastName": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

查看索引库

````sh
GET /索引库名
````

删除索引库

```sh
DELETE /索引库名
```

==索引库一旦创建，无法修改mapping,但是可以添加新的字段==

```json
PUT /user/_mapping
{
  "properties": {
    "age": {
      "type": "integer",
      "index": false
    }
  }
}
```

## 文档操作

**新增文档**`POST /索引库名/_doc/文档id`

```json
POST /user/_doc/1
{
  "info": "湖南化工大三学生",
  "age": 18,
  "email": "zs@136.com",
  "name": {
    "firstName": "张",
    "lastName": "三"
  }
}
```

**查看文档**`get /索引库名/_doc/文档id`

```sh
GET /user/_doc/1
```

**修改文档**

- 全量修改 `PUT(POST) /索引库名/_doc/文档id`

  ```json
  PUT /user/_doc/1
  {
    "info": "大三学生",
    "age": 18,
    "email": "zs@136.com",
    "name": {
      "firstName": "李",
      "lastName": "四"
    }
  }
  ```
- 增量修改 `POST /索引库名/_update/文档id`

  ```json
  POST /user/_update/1
  {
    "doc": {
      "age": 20
    }
  }
  ```

> - **创建文档**：POST /{索引库名}/_doc/文档id   { json文档 }
> - **查询文档**：GET /{索引库名}/_doc/文档id
> - **删除文档**：DELETE /{索引库名}/_doc/文档id
> - **修改文档**：
>   - **全量修改**：PUT /{索引库名}/_doc/文档id { json文档 }
>   - **增量修改**：POST /{索引库名}/_update/文档id { "doc": {字段}}

## RestAPI

**ES官方提供了各种不同语言的客户端，用来操作ES。这些客户端的本质就是组装DSL语句，通过http请求发送给ES**

其中的[Java Rest Client](https://www.elastic.co/guide/en/elasticsearch/client/index.html)又包括两种：

- **Java Low Level Rest Client**
- **Java High Level Rest Client**

**创建索引库**

![image-20221231223610656](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675964-ec7764ee2e4bf94aa04ffac4c1362795716b0615.png)

```json
PUT /hotel {
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "name": {
        "type": "text",
        "analyzer": "ik_smart",
        "copy_to": "{all}"
      },
      "address": {
        "type": "keyword",
        "index": false
      },
      "price": {
        "type": "integer"
      },
      "score": {
        "type": "integer"
      },
      "brand": {
        "type": "keyword",
        "copy_to": "{all}"
      },
      "city": {
        "type": "keyword",
        "copy_to": "{all}"
      },
      "star_name": {
        "type": "keyword",
        "copy_to": "{all}"
      },
      "business": {
        "type": "keyword",
        "copy_to": "{all}"
      },
      "location": {
        "type": "geo_point"
      },
      "pic": {
        "type": "keyword",
        "index": false
      },
      "all": {
        "type": "text",
        "analyzer": "ik_smart"
      }
    }
  }
}
```

> - **location**：地理坐标，里面包含精度、纬度
> - **all**：一个组合字段，其目的是将多字段的值 利用copy_to合并，提供给用户搜索

### 初始化RestClient

**导入依赖**

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
```

**初始化**`RestHighLevelClient`

```java
RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
        HttpHost.create("http://12.0.0.1:9200")
));
```

### 索引库操作

**创建索引库**

```java
@Test
void createHotelIndex() throws IOException {
    //创建request对象
    CreateIndexRequest request = new CreateIndexRequest( INDEX_NAME );
    //请求参数
    request.source( MAPPING_TEMPLATE, XContentType.JSON );
    //发送请求创建索引库
    client.indices().create( request, RequestOptions.DEFAULT );
}
```

**删除索引库**

```java
@Test
void deleteIndex() throws IOException {
    DeleteIndexRequest request = new DeleteIndexRequest( INDEX_NAME );
    client.indices().delete( request,RequestOptions.DEFAULT );
}
```

**索引是否存在**

```java
@Test
    void isExistIndex() throws IOException {
        GetIndexRequest request = new GetIndexRequest( INDEX_NAME );
        boolean exists = client.indices().exists( request, RequestOptions.DEFAULT );
        log.info( exists ? "索引库存在" : "索引库不存在" );
    }
}
```

### 文档操作

**插入文档**

![image-20230101170541406](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675972-fdeb63a86b6faed8ba31842c7844df0bce49b525.png)

```java
@Test
void insertDoc() throws IOException {
    IndexRequest request = new IndexRequest( INDEX_NAME ).id( "36934" );
    request.source( 
        "price","446",
        "starName","三钻",XContentType.JSON
    );
    client.index( request,RequestOptions.DEFAULT );
}
```

**查询文档**

![image-20230101170637708](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675976-d488a1f1f719f3bae9791df368191f8d546e4552.png)

```java
@Test
void queryDoc() throws IOException {
    GetRequest request = new GetRequest( INDEX_NAME,"36934" );
    GetResponse documentFields = client.get( request, RequestOptions.DEFAULT );
    System.out.println( documentFields.getSourceAsString() );
}
```

**删除文档**

```java
@Test
void deleteDoc() throws IOException {
    DeleteRequest request = new DeleteRequest( INDEX_NAME,"36934" );
    DeleteResponse delete = client.delete( request, RequestOptions.DEFAULT );
    System.out.println( delete.status() );
}
```

**修改文档**

![image-20230101170744098](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675981-d4318ad3e59f7b2621a996b4a694318556d5e98f.png)

```java
@Test
void updateDoc() throws IOException {
    UpdateRequest request = new UpdateRequest( "hotel", "36934" );
    request.doc(
        "price","446",
        "starName","三钻"
    );
    client.update( request,RequestOptions.DEFAULT );
}
```

**批量操作**

```java
@Test
void bulkInsert(){
    //获取数据
    List<Hotel> hotels = hotelService.list();
    BulkRequest request = new BulkRequest();
    hotels.forEach( hotel -> {
        HotelDoc hotelDoc = new HotelDoc( hotel );
        //创建文档request
        IndexRequest index = new IndexRequest( "hotel" ).id( hotelDoc.getId().toString() );
        index.source( JSON.toJSONString( hotelDoc ),XContentType.JSON );
        //添加数据
        request.add( index );
        //批量插入
        try {
            client.bulk( request,RequestOptions.DEFAULT );
        } catch ( IOException e ) {
            throw new RuntimeException( e );
        }
    } );
}
```

## 查询文档

### 分类查询

**`Elasticsearch`提供了基于`JSON`的DSL（[Domain Specific Language](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)）来定义查询**

- **查询所有**：查询出所有数据，一般测试用  ***match_all***
- **全文检索（full text）查询**：利用分词器对用户输入内容分词，然后去倒排索引库中匹配

  - ***match***
  - ***multi_match***
- **精确查询**：根据精确词条值查找数据，一般是查找keyword、数值、日期、boolean等类型字段

  - ***ids***
  - ***range***
  - ***term***
- **地理（geo）查询**：根据经纬度查询

  - ***geo_distance***
  - ***geo_bounding_box***
- **复合（compound）查询**：复合查询可以将上述各种查询条件组合起来，合并查询条件

  - ***bool***
  - ***function_score***

![image-20230101223511950](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675989-713813eaf3d05367328864715bf26bf67156d063.png)

**match_all**

```json
// 查询所有
GET /indexName/_search
{
  "query": {
    "match_all": {
    }
  }
}
```

#### 全文检索查询

- 对用户搜索的内容做分词，得到词条
- 根据词条去倒排索引库中匹配，得到文档id
- 根据文档id找到文档，返回给用户

***match***单字段查询

![image-20230101223838246](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675994-33dc891450f4a3608cc4a7101aea082e25ed46ec.png)

```json
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "上海"
    }
  }
}
```

***multi_match***多字段查询

![image-20230101224014611](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710675998-8105aee2c6766ac477ad0044d629c6afc32b0d56.png)

```json
GET /hotel/_search
{
  "query": {
    "multi_match": {
      "query": "上海外滩",
      "fields": ["name","brand"]
    }
  }
}
```

**搜索字段越多，对查询性能影响越大，建议采用copy_to，然后单字段查询的方式**

#### 精确查询

**精确查询一般是查找keyword、数值、日期、boolean等类型字段。所以不会对搜索条件分词**

- ***term***：根据词条精确值查询
- ***range***：根据值的范围查询

`term`查询

精确查询的字段搜是不分词的字段，因此查询的条件也必须是**不分词**的词条。查询时，用户输入的内容跟自动值完全匹配时才认为符合条件。如果用户输入的内容过多，反而搜索不到数据

![image-20230101224424984](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676003-10ddc9e7205d5c6b3c88648c8918ad89fb33a434.png)

```json
GET /hotel/_search
{
  "query": {
    "term": {
      "id": {
        "value": "60487"
      }
    }
  }
}
```

`range`查询

![image-20230101224621289](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676006-6f03db92ed65ea95718be0bb69f8010624b96125.png)

```json
GET /hotel/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 200
      }
    }
  }
}
```

#### 地理坐标查询

***geo_bounding_box***查询

查询时，需要指定矩形的**左上**、**右下**两个点的坐标，然后画出一个矩形，落在该矩形内的都是符合条件的点

![image-20230101225010426](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676011-0a19d19f5fcedd70e279b35706bfa962383450b3.png)

```json
// geo_bounding_box查询
GET /indexName/_search
{
  "query": {
    "geo_bounding_box": {
      "FIELD": {
        "top_left": { // 左上点
          "lat": 31.1,
          "lon": 121.5
        },
        "bottom_right": { // 右下点
          "lat": 30.9,
          "lon": 121.7
        }
      }
    }
  }
}
```

***geo_distance***查询

查询到指定中心点小于某个距离值的所有文档。

![image-20230101234902614](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676017-fb48ae682d17dcba3cca2987a82d7a7945fa4491.png)

```json
// geo_distance 查询
GET /indexName/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km", // 半径
      "FIELD": "31.21,121.5" // 圆心
    }
  }
}
```

#### 复合查询

复合（compound）查询：复合查询可以将其它简单查询组合起来，实现更复杂的搜索逻辑。常见的有两种：

- ***fuction score***：算分函数查询，可以控制文档相关性算分，控制文档排名
- ***bool***：布尔查询，利用逻辑关系组合多个其它的查询，实现复杂搜索

**相关性算分**

match查询时，文档结果会根据与搜索词条的关联度打分（_score），返回结果时按照分值降序排列

![image-20230101232058863](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676028-ab2047d6b633ac5f6a8d24c8915c7781ad245434.png)

- TF-IDF算法有一各缺陷，就是词条频率越高，文档得分也会越高，单个词条对文档影响较大。而BM25则会让单个词条的算分有一个上限，曲线更加平滑
- ![image-20230101232240100](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676038-280e092cfba17cf7ad89cc4fa0274c986c5ea613.png)

##### function score 查询

- **原始查询**条件：query部分，基于这个条件搜索文档，并且基于BM25算法给文档打分，**原始算分**（query score)
- **过滤条件**：filter部分，符合该条件的文档才会重新算分
- **算分函数**：符合filter条件的文档要根据这个函数做运算，得到的**函数算分**（function score），有四种函数
  - weight：函数结果是常量
  - field_value_factor：以文档中的某个字段值作为函数结果
  - random_score：以随机数作为函数结果
  - script_score：自定义算分函数算法
- **运算模式**：算分函数的结果、原始查询的相关性算分，两者之间的运算方式，包括：
  - multiply：相乘
  - replace：用function score替换query score
  - 其它，例如：sum、avg、max、min

![image-20230101235152221](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676043-4bfc30a65f3e062724c76a8f8145c959ae32f4e3.png)

> - 根据**原始条件**查询搜索文档，并且计算相关性算分，称为**原始算分**（query score）
> - 根据**过滤条件**，过滤文档
> - 符合**过滤条件**的文档，基于**算分函数**运算，得到**函数算分**（function score）
> - 将**原始算分**（query score）和**函数算分**（function score）基于**运算模式**做运算，得到最终结果，作为相关性算分
>   - 过滤条件：决定哪些文档的算分被修改
>   - 算分函数：决定函数算分的算法
>   - 运算模式：决定最终算分结果

```json
GET /hotel/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": {
          "all": "外滩"
        }
      },
      "functions": [
        {
          "filter": {
            "term": {
              "name": "如家"
            }
          },
          "weight": 2
        }
      ],
      "boost_mode": "sum"
    }
  }
}
```

##### 布尔查询

- ![image-20230102000316911](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676050-09b21608693d150d591a6379c815b7c2e3a53b65.png)

搜索时，参与**打分的字段越多，查询的性能也越差**。因此这种多条件查询时，建议这样做：

- 搜索框的关键字搜索，是全文检索查询，使用must查询，参与算分
- 其它过滤条件，采用filter查询。不参与算分

```json
GET /hotel/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "如家"
          }
        }
      ],
      "must_not": [
        {
          "range": {
            "price": {
              "gte": 400
            }
          }
        }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "100km",
            "location": {
              "lat": 31.73,
              "lon": 121.1
            }
          }
        }
      ]
    }
  }
}
```

##### 搜索结果处理

1. **排序**

`elasticsearch`默认是根据相关度算分（_score）来排序，但是也支持自定义方式对搜索[结果排序](https://www.elastic.co/guide/en/elasticsearch/reference/current/sort-search-results.html)。可以排序字段类型有：keyword类型、数值类型、地理坐标类型、日期类型等

**普通字段排序**keyword、数值、日期类型排序的语法基本一致

![image-20230102002209247](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676056-87936ff1dcfaf91af98e8c129a7cf9df7cb86695.png)

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "price": {
        "order": "desc"
      },
      "starName": "asc"
    }
  ]
}
```

排序条件是一个数组，也就是可以写多个排序条件。按照声明的顺序，当第一个条件相等时，再按照第二个条件排序，以此类推

**地理坐标排序**

![image-20230102002308535](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676060-64fc5d999f4e61144cbba1c3dd6df6007de02c24.png)

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "_geo_distance": {
        "location": "31,121",
        "unit": "km", 
        "order": "asc"
      }
    }
  ]
}
```

**分页**

elasticsearch 默认情况下只返回top10的数据。而如果要查询更多数据就需要修改分页参数了。elasticsearch中通过修改from、size参数来控制要返回的分页结果

- from：从第几个文档开始
- size：总共查询几个文档

![image-20230102003114605](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676064-b9743111df51cc2a45a8b53abe83ad31cf903ddb.png)

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 20
}
```

**深度分页问题**

![image-20230102004206410](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676069-57f07963f7e33ed1d35cfa0b37377036e27a499f.png)

针对深度分页，ES提供了两种解决方案，[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)：

- search after：分页时需要排序，原理是从上一次的排序值开始，查询下一页数据。官方推荐使用的方式
- scroll：原理将排序后的文档id形成快照，保存在内存。官方已经不推荐使用

> 分页查询的常见实现方案以及优缺点：
>
> - `from + size`：
>
>   - 优点：支持随机翻页
>   - 缺点：深度分页问题，默认查询上限（from + size）是10000
>   - 场景：百度、京东、谷歌、淘宝这样的随机翻页搜索
> - `after search`：
>
>   - 优点：没有查询上限（单次查询的size不超过10000）
>   - 缺点：只能向后逐页查询，不支持随机翻页
>   - 场景：没有随机翻页需求的搜索，例如手机向下滚动翻页
> - `scroll`：
>
>   - 优点：没有查询上限（单次查询的size不超过10000）
>   - 缺点：会有额外内存消耗，并且搜索结果是非实时的
>   - 场景：海量数据的获取和迁移。从ES7.1开始不推荐，建议用 after search方案

**高亮**

![image-20230102004454522](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676078-98339571c41d810ef0d9b896545f63d0a212dff3.png)

```json
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "如家"
    }
  },
  "highlight": {
    "fields": {
      "name": {
        "require_field_match": "false"		//字段匹配
      }
    }
  }
}
```

> - 高亮是对关键字高亮，因此**搜索条件必须带有关键字**，而不能是范围这样的查询。
> - 默认情况下，**高亮的字段，必须与搜索指定的字段一致**，否则无法高亮
> - 如果要对非搜索字段高亮，则需要添加一个属性：required_field_match=false

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676083-cca5aab3e67c9efc4bea06cf35a444c9b7373917.png" alt="image-20230102005334554" style="zoom:50%;" />

### RestClient查询文档

`match,match_all`**查询**

![image-20230102005835404](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676087-3849443b42f8beec24d3d30da88535d41c27797a.png)

```java
@Test
void matchAll() throws IOException {
    SearchRequest request = new SearchRequest( "hotel" );
    request.source().query( QueryBuilders.matchQuery( "all","如家" ) );
    SearchResponse search = client.search( request, RequestOptions.DEFAULT );
    this.jsonAnalysis( search );
}
```

**结果解析**

![image-20230103235927514](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676092-9480a8a19e23e92461f6af0d6a72eb35000bd8ce.png)

> - `hits`：命中的结果
>   - `total`：总条数，其中的value是具体的总条数值
>   - `max_score`：所有结果中得分最高的文档的相关性算分
>   - `hits`：搜索结果的文档数组，其中的每个文档都是一个json对象
>     - `_source`：文档中的原始数据，也是json对象
>
> 逐层解析JSON字符串
>
> - `SearchHits`：通过response.getHits()获取，就是JSON中的最外层的hits，代表命中的结果
>   - `SearchHits#getTotalHits().value`：获取总条数信息
>   - `SearchHits#getHits()`：获取SearchHit数组，也就是文档数组
>     - `SearchHit#getSourceAsString()`：获取文档结果中的_source，也就是原始的json文档数据

```java
void jsonParse( SearchResponse response ){
    SearchHits searchHits = response.getHits();
    //总记录数
    long total = searchHits.getTotalHits().value;
    System.out.println( "查询到:"+total+"条数据" );
    SearchHit[] hitsHits = searchHits.getHits();
    for ( SearchHit hit : hitsHits ) {
        //获取数据
        String json = hit.getSourceAsString();
        //反序列化流
        HotelDoc hotelDoc = JSON.parseObject( json, HotelDoc.class );

        //获取高亮数据
        Map<String, HighlightField> highlightFields = hit.getHighlightFields();
        if ( !CollectionUtils.isEmpty( highlightFields ) ) {

            //根据字段名获取高亮结果
            HighlightField field = highlightFields.get( "name" );
            if ( field != null ){
                String name = field.getFragments()[0].string();
                hotelDoc.setName( name );
            }

        }
        System.err.println( hotelDoc );
    }

}
```

**精确查询**

![image-20230104000255970](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676098-2abe2d841732c8b45bea467027019cdc0e4134a7.png)

```Java
@Test
void termSearch() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );

    request.source().query( QueryBuilders.termQuery( "city","上海" ) );
    SearchResponse response = client.search( request, RequestOptions.DEFAULT );
    this.jsonParse( response );
}

@Test
void rangeSearch() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );
    request.source().query(
        QueryBuilders.rangeQuery( "price" )
        .gte( 1000 ).lte( 2000 )
    );
    SearchResponse response = client.search( request, RequestOptions.DEFAULT );
    this.jsonParse( response );
}
```

**复杂查询**

![image-20230104004344888](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676103-ac81e53c19245fbe5d28ecd020ed7561b1a14ef5.png)

```java
@Test
void boolSearch() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );
    request.source().query( QueryBuilders.boolQuery()
                           .must( QueryBuilders.termQuery( "city","上海" ) )
                           .filter( QueryBuilders.rangeQuery( "price" ).lte( 200 ) )
                          );
    SearchResponse search = client.search( request, RequestOptions.DEFAULT );
    this.jsonParse( search );
}
```

**排序和分页**

![image-20230104001406296](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676107-c3b7173b7819003d0519bc801ad551ceceb9de14.png)

```java
@Test
void pageQuery() throws IOException {
    int form = 3;
    int size = 10;

    SearchRequest request = new SearchRequest( "hotel" );
    //DSL
    request.source().query( QueryBuilders.matchAllQuery() );
    //排序
    request.source().sort( "price", SortOrder.ASC );
    //分页
    request.source().from( (form-1)*size ).size( size );
    SearchResponse search = client.search( request, RequestOptions.DEFAULT );
    this.jsonAnalysis( search );
}
```

**高亮**

![image-20230104002050529](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676111-cc5027e7ecb8a859fcb2683c1123d94b18a14e54.png)

```java
@Test
void highlight() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );
    request.source().query( QueryBuilders.matchQuery( "all","如家" ) )
        .highlighter( new HighlightBuilder()
                     .field( "name" )
                     //忽略字段匹配
                     .requireFieldMatch( false )
                    );
    SearchResponse search = client.search( request, RequestOptions.DEFAULT );
    System.out.println( search.getHits() );
}
```

json解析

![image-20230104003844914](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676117-b74bea923a4a49e8781accb24bc4561c35401a26.png)

```java
//获取高亮数据
Map<String, HighlightField> highlightFields = hit.getHighlightFields();
if ( !CollectionUtils.isEmpty( highlightFields ) ) {

    //根据字段名获取高亮结果
    HighlightField field = highlightFields.get( "name" );
    if ( field != null ){
        String name = field.getFragments()[0].string();
        hotelDoc.setName( name );
    }

}
```

## 数据聚合

**[聚合（](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)[aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)[）](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)**可以让我们极其方便的实现对数据的统计、分析、运算,聚合常见的有三类

- **桶（Bucket）**聚合：用来对文档做分组
  - TermAggregation：按照文档字段值分组，例如按照品牌值分组、按照国家分组
  - Date Histogram：按照日期阶梯分组，例如一周为一组，或者一月为一组
- **度量（Metric）**聚合：用以计算一些值，比如：最大值、最小值、平均值等
  - Avg：求平均值
  - Max：求最大值
  - Min：求最小值
  - Stats：同时求max、min、avg、sum等
- **管道（pipeline）**聚合：其它聚合的结果为基础做聚合

> ***参加聚合的字段必须是keyword、日期、数值、布尔类型***

### Bucket聚合

![image-20230104170110406](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676124-002db429f88750b14fe83088daeb7ae03043c429.png)

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAggs": {
      "terms": {
        "field": "brand",
        "size": 10,
        "order": {
          "_count": "asc"	//修改聚合的排序
        }
      }
    }
  }
}
```

**限定聚合的范围**

默认情况下，Bucket聚合是对索引库的所有文档做聚合，但真实场景下，用户会输入搜索条件，因此聚合必须是对搜索结果聚合。那么聚合必须添加限定条件，只要添加query条件即可

![image-20230104170418453](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676128-229384ac223a6a8a71f53807fc7df6385317e9ab.png)

```json
GET /hotel/_search
{
  "size": 0,
  "query": {
    "range": {
      "price": {
        "gte": 1000
      }
    }
  },
  "aggs": {
    "brandAggs": {
      "terms": {
        "field": "brand",
        "size": 10
      }
    }
  }
}
```

> - aggs代表聚合,与query同级,query限定聚合的范围
> - 聚合三要素
>   - 名称
>   - 类型
>   - 字段
> - 聚合可配置的属性
>   - size  聚合结果数量
>   - order 聚合结果排序方式
>   - field  聚合字段

### Metric聚合语法

![image-20230104170837880](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676134-72b01c1d114ce818b70eea0c28d76fc5f6ad8399.png)

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAggs": {
      "terms": {
        "field": "brand",
        "size": 10,
        "order": {
          "avgAggs.avg": "asc"		//对聚合桶内的结果排序
        }
      },
      "aggs": {
        "avgAggs": {
          "stats": {
            "field": "score"
          }
        }
      }
    }
  }
}
```

### RestAPI实现聚合

![image-20230104171146240](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676138-fe021e4002f196bd678603a720e71e3200c7542d.png)

```java
@Test
void bucketAggs() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );
    //文档数量
    request.source().size( 0 )
        //限定聚合范围
        .query( QueryBuilders
               .rangeQuery( "price" )
               .gte( 1000 ) )
        //聚合
        .aggregation( AggregationBuilders
                     //桶名称
                     .terms( "brandAggs" )
                     //字段
                     .field("brand" )
                     .size(10)
                     //排序方式
                     .order( BucketOrder.count( true ) )
                    );

    SearchResponse response = client.search( request, RequestOptions.DEFAULT );

    this.jsonParse( response );
}
```

**结果解析**

![image-20230104172337620](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676145-51f0250a79e5dc946cfd2757c4087afd2c82d9e0.png)

```java
void jsonParse( SearchResponse response ){
    Terms brandAggs = response.getAggregations().get( "brandAggs" );
    List<? extends Terms.Bucket> buckets = brandAggs.getBuckets();
    buckets.forEach( bucket -> System.err.println( bucket.getKeyAsString() ) );
}
```

**Metric聚合**

```java
@Test
void metricAggs() throws IOException {
    SearchRequest request = new SearchRequest( INDEX_NAME );
    request.source().size( 0 ).aggregation( AggregationBuilders
            .terms( "brandAggs" )
            .size( 10 )
            .field("brand")
    );
    request.source().aggregation( AggregationBuilders
            .stats( "avgAggs" )
            .field( "score" )
    );
    SearchResponse response = client.search( request, RequestOptions.DEFAULT );
    this.jsonParse( response );
}
```

## 拼音分词器

**要实现根据字母做补全，就必须对文档按照[拼音分词](https://github.com/medcl/elasticsearch-analysis-pinyin),将下载好的压缩包解压上传到es的插件目录,重启后生效**

![image-20230105174250047](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676151-8f08017f1e52b170c71baeae5d09b9458cfeb1a8.png)

![image-20230105180800988](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676159-4e8e879eeb425c9c412e587f125c2ff3bd44144b.png)

**自定义分词器**

**默认的拼音分词器会将每个汉字单独分为拼音，而我们希望的是每个词条形成一组拼音，需要对拼音分词器做个性化定制，形成自定义分词器,`elasticsearch`中分词器（analyzer）的组成包含三部分**

- **character filters**：在tokenizer之前对文本进行处理。例如删除字符、替换字符
- **tokenizer**：将文本按照一定的规则切割成词条（term）。例如keyword，就是不分词；还有ik_smart
- **tokenizer filter**：将tokenizer输出的词条做进一步处理。例如大小写转换、同义词处理、拼音处理等

![image-20230105180634118](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676163-d2e44ece1098f152efe56a87f92a6500a1a7bcfc.png)

**声明自定义分词器的语法**

```json
PUT /test
{
  "settings": {
    "analysis": {
      "analyzer": {			// 自定义分词器
        "my_analyzer": {	// 分词器名称
          "tokenizer": "ik_max_word",
          "filter": "py"
        }
      },
      "filter": {			// 自定义tokenizer filter
        "py": {				// 过滤器名称
          "type":"pinyin",	// 过滤器类型，这里是pinyin
          "keep_full_pinyin": false,
          "keep_joined_full_pinyin": true,
          "keep_original": true,
          "limit_first_letter_length": 16,
          "remove_duplicated_term": true,
          "none_chinese_pinyin_tokenize": false
        
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "my_analyzer",
        "search_analyzer": "ik_smart"
      }
    }
  }
}
```

![image-20230105180549484](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676169-29d25b65dec8b1f129716554193820c16a60641f.png)

**自动补全**

elasticsearch提供了[Completion Suggester](https://www.elastic.co/guide/en/elasticsearch/reference/7.6/search-suggesters.html)查询来实现自动补全功能。这个查询会匹配以用户输入内容开头的词条并返回。为了提高补全查询的效率，对于文档中字段的类型有一些约束：

- 参与补全查询的字段必须是completion类型。
- 字段的内容一般是用来补全的多个词条形成的数组

![image-20230105181751527](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676175-109902035d9b3515568dcd823426940148893383.png)

**查询DSL**

```json
GET /test2/_search
{
  "suggest": {
    "YOUR_SUGGESTION": {
      "text": "s",		//关键字
      "completion": {
        "field": "name", //补全字段
        "skip_duplicates": true, //跳过重复的
        "size": 10	//结果条数
      }
    }
  }
}
```

![image-20230105184301762](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676180-430e2c84a08868e731fdc700a9721c6712a15e41.png)

```java
@Test
void suggest() throws IOException {
    SearchRequest request = new SearchRequest( "hotel" );
    request.source().suggest( new SuggestBuilder().addSuggestion(
        "suggestions",
            SuggestBuilders.completionSuggestion( "suggestion" )
                    .prefix( "上海" )
                    //是否跳过重复的
                    .skipDuplicates( true )
                    .size( 10 )
    ) );
    SearchResponse search = client.search( request, RequestOptions.DEFAULT );
    CompletionSuggestion suggestions = search.getSuggest().getSuggestion( "suggestions" );
    suggestions.getOptions().forEach( suggest->{
        System.out.println( suggest.getText().string() );
    } );
}
```

![image-20230105201611037](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676186-9392af19fa637d1e4c93234286b09f0bbb7eb271.png)

```java
CompletionSuggestion suggestions = search.getSuggest().getSuggestion( "suggestions" );
suggestions.getOptions().forEach( suggest->{
    System.out.println( suggest.getText().string() );
} );
```

## 数据同步

![image-20230105201715821](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676192-a45982197f1910337acd967ff8c31f62216437b9.png)

方式一：同步调用

- 优点：实现简单，粗暴
- 缺点：业务耦合度高

![image-20230105201839698](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676197-6c30a3e44fb15737072c6764606fcd22a5705139.png)

- 优点：低耦合，实现难度一般
- 缺点：依赖mq的可靠性

![image-20230105201941697](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676201-840221f6fd8c157d5cc695c8b966937601545508.png)

方式三：监听binlog

- 优点：完全解除服务间耦合
- 缺点：开启binlog增加数据库负担、实现复杂度高

## 集群

**单机的`elasticsearch`做数据存储，必然面临两个问题**

![image-20230105231000138](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676206-2b5b4065c2fe44828db56851c927d7e1a520bef6.png)

### 集群搭建

编写docker-compose文件,并运行

```sh
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.7
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.7
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    networks:
      - elastic
  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.7
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

![image-20230105231607365](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676212-63908f8c0aa69f5c37b7b87af1128ce0aaa7cb1f.png)

es中集群节点的职责划分


| **节点类型**     | **配置参数**                             | **默认值** | **节点职责**                                                                             |
| ------------------ | ------------------------------------------ | :----------: | :----------------------------------------------------------------------------------------- |
| master  eligible | node.master                              |    true    | 备选主节点：主节点可以管理和记录集群状态、决定分片在哪个节点、处理创建和删除索引库的请求 |
| data             | node.data                                |    true    | 数据节点：存储数据、搜索、聚合、CRUD                                                     |
| ingest           | node.ingest                              |    true    | 数据存储之前的预处理                                                                     |
| coordinating     | 上面3个参数都为false则为coordinating节点 |     无     | 路由请求到其它节点  合并其它节点处理的结果，返回给用户                                   |

![image-20230105232001513](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676217-ae8485a5279130fdbeb684aa50f84f4c86aca9ea.png)

**脑裂**

在一个集群中，主节点与其它节点失联,此时，node2和node3认为node1宕机，就会重新选主,当node3当选后，集群继续对外提供服务，node2和node3自成集群，node1自成集群，两个集群数据不同步，出现数据差异。当网络恢复后，因为集群中有两个master节点，集群状态的不一致，出现脑裂的情况：

![image-20230105232246905](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676220-509b6d45fb15e3558f7771c3a81f4000e04c0219.png)

**分布式存储**

![image-20230105232356162](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676225-efbff63fb512cb51de8fbb5fce408e78c6748670.png)

**分布式查询**

![image-20230105232515949](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676229-7a2be43b7c5e2a01fd01212bb798ad2e70d83e61.png)

**故障转移**

![image-20230105232557744](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/1710676234-a595489e458a6e997b5c111666c4ab7360d2949a.png)
