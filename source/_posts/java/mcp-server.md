---
title: 使用spring-ai实现mcp-server
tags:
  - java
  - ai
abbrlink: 58bc53c1
date: 2025-04-04 23:57:49
---



**官方文档：https://modelcontextprotocol.io/quickstart/server**

**使用spring-ai实现mcp-server服务，项目搭建：https://start.spring.io  添加主要依赖**

```groovy
implementation 'org.springframework.boot:spring-boot-starter-web'
implementation 'org.springframework.ai:spring-ai-mcp-server-webmvc-spring-boot-starter'
```



**通过备忘录功能实现mcp-server功能，数据库实体类和DO层** 

```java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String status;
    private String description;
}
```

```java
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findTaskByName(String name);
}
```



**备忘录功能MCP功能实现：**

```java
@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;

    @Tool(description = "获取所有任务")
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Tool(description = "根据任务名称获取任务")
    public Task getTaskByName(@ToolParam(description = "任务名称") String name) {
        return taskRepository.findTaskByName(name).stream().findFirst().get();
    }

    @Tool(description = "根据任务名称和描述创建任务")
    public Task createTask(@ToolParam(description = "任务名称") String name,
                           @ToolParam(description = "任务描述") String desc) {
        Task task = new Task();
        task.setName(name);
        task.setStatus("待办");
        task.setDescription(desc);
        return taskRepository.save(task);
    }

    @Tool(description = "根据任务名称更新任务状态，任务有'待办', '进行中', '已完成', '已取消'四个状态")
    public Task updateTask(@ToolParam(description = "任务名称") String name,
                           @ToolParam(description = "任务的状态，任务有'待办', '进行中', '已完成', '已取消'四个状态") String status) {
        Task task = taskRepository.findTaskByName(name).stream()
                .findFirst().orElseThrow(() -> new RuntimeException("Task not found with name: " + name));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Tool(description = "根据名称删除任务")
    public void deleteTask(@ToolParam(description = "任务名称") String name) {
        Task task = taskRepository.findTaskByName(name).stream()
                .findFirst().orElseThrow(() -> new RuntimeException("Task not found with name: " + name));
        taskRepository.delete(task);
    }

}
```


**MCP服务注册**

```java
@Bean
public ToolCallbackProvider weatherTools(TaskService taskService) {
    return MethodToolCallbackProvider.builder().toolObjects(taskService).build();
}
```



**使用cline插件使用MCP-Server服务**

![截屏2025-04-05_00.34.46](https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/123.png)



**编辑配置文件**

```json
{
  "mcpServers": {
    "spring-ai-mcp-task": {
      "command": "java",
      "args": [
        "-Dspring.ai.mcp.server.stdio=true",
        "-jar",
        "/Users/hg/code/java/mcp-server/build/libs/mcpserver-0.0.1-SNAPSHOT.jar"
      ]
    }
  }
}
```



**使用示例：**

<img src="https://hougen.oss-cn-guangzhou.aliyuncs.com/blog-img/123.gif" style="zoom: 25%;" />

