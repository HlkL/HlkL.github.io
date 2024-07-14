frp 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议，且支持 P2P 通信。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。

### 公网服务器部署配置

根据系统名称及架构下载frp：https://github.com/fatedier/frp/releases

```shell
sudo uname -s
sudo uname -m
```

上传压缩包到 /opt/frp 目录，修改 frps.toml 文件

```toml
#服务绑定的IP与端口
bindAddr = "0.0.0.0"
bindPort = 7000
#web dashboard配置
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "frp"
webServer.password = "frp"
#启用prometheus监控指标
enablePrometheus = true
#token权限验证，需与客户端配置一致
auth.method = "token"
auth.token = "123456"
#日志配置
log.to = "./frps.log"
log.level = "info"
log.maxDays = 3
```

启动frps服务：

- 命令行

  ```shell
  ./frps -c ./frps.toml
  ```

- 后台启动

  ```shell
  nohup ./frps -c ./frps.toml &> /dev/null &
  ```

- 系统服务 `sudo vim /etc/systemd/system/frps.service` 

  ```shell
  [Unit]
  Description=FRP Server Service
  After=network.target
  
  [Service]
  Type=simple
  ExecStart=/opt/frp/frps -c /opt/frp/frps.toml
  Restart=on-failure
  RestartSec=5s
  User=frps
  Group=frps
  
  [Install]
  WantedBy=multi-user.target
  ```

  配置 frps 用户和用户组

  ```shell
  sudo useradd -r -s /bin/false frps
  ```

  `-r` 选项创建一个系统用户。

  `-s /bin/false`  选项确保该用户无法登录。

  配置用户权限

  ```shell
  sudo chown -R frps:frps /opt/frp
  ```

  启动服务

  ```shell
  sudo systemctl daemon-reload
  sudo systemctl start frps
  sudo systemctl enable frps
  ```

  查看日志

  ```shell
  sudo journalctl -u frps -f
  ```

### 内网客户端部署配置

修改 frpc.toml 文件

```toml
#配置公网服务器上frp服务的IP与端口
serverAddr = ""
serverPort = 7000
# web dashboard配置
webServer.addr = "0.0.0.0"
webServer.port = 7400
# webServer.user = "admin"
# webServer.password = "admin"
#日志配置
log.to = "./frpc.log"
log.level = "info"
log.maxDays = 3
#token权限验证，需与服务端配置一致
auth.method = "token"
auth.token = ""
#代理配置，这里使用引用文件的方式
includes = ["./proxy_conf/*.toml"]
```

代理服务配置：proxy_conf 目录下 xxx.toml 文件

```toml
[[proxies]]
name = "demo"			     #名称
type = "tcp"				   #代理类型
localIP = "127.0.0.1"	 #本地IP
localPort = 8000			 #内网服务监听的端口
remotePort = 8500			 #需要在公网服务器上监听的端口
```

### 官方示例配置

中文： https://gofrp.org/zh-cn/docs/examples/

### 其他内网穿透方案

花生壳：https://hsk.oray.com

cloudflare：https://one.dash.cloudflare.com/networks/tunnels

ngrok： https://ngrok.com

