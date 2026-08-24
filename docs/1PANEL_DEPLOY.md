# 🚀 1Panel 运维面板极速部署指南 (free-play-view)

本文档介绍如何在 **1Panel 服务器运维面板** 中使用 Docker Compose 一键部署 **休闲游戏与多功能百宝箱平台**。

---

## 📋 部署准备信息

| 项目 | 参数值 | 说明 |
| :--- | :--- | :--- |
| **容器镜像 (ACR)** | `crpi-vrso5s2zv7dk1hk1.cn-wulanchabu.personal.cr.aliyuncs.com/pangxiaoyin/free-play-view:latest` | 阿里云 ACR 最新稳定镜像 |
| **容器内部端口** | `80` | Nginx 聚合：`/` 对应移动前台，`/admin/` 对应 PC 管理后台 |
| **宿主机绑定端口** | `127.0.0.2:8080` | **专属本地回环地址绑定**（防公网直接探测，供 1Panel 反代稳定直连） |

---

## ⚡ 1Panel 部署步骤（两分钟完成）

### 第一步：创建 1Panel 容器编排 (Compose)
1. 在 1Panel 左侧菜单进入 **【容器】 -> 【编排】 -> 【创建编排】**；
2. 填写基本信息：
   - **名称**：`free-play-view`
   - **路径**：默认即可
3. 在 **【编排内容】** 输入框中，直接粘贴以下 YAML 内容：

```yaml
name: free-play-view

services:
  web:
    image: crpi-vrso5s2zv7dk1hk1.cn-wulanchabu.personal.cr.aliyuncs.com/pangxiaoyin/free-play-view:latest
    container_name: free-play-view-web
    restart: always
    ports:
      # 绑定至 127.0.0.2 回环地址，防止公网端口裸奔，避免端口冲突与 502 错误
      - "127.0.0.2:8080:80"
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://127.0.0.1/ || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s
```

4. 点击 **【确认】**，1Panel 会自动拉取镜像并启动容器！

---

### 第二步：配置 1Panel 网站反向代理与域名

为了让外部用户通过你的正式域名或 IP 访问，需在 1Panel 中创建反向代理：

1. 进入 1Panel **【网站】 -> 【创建网站】 -> 【反向代理】**；
2. 填写网站配置：
   - **主域名**：填写你的域名（例如 `game.yourdomain.com`，或服务器公网 IP 配合自定义端口）；
   - **代理地址**：`http://127.0.0.2:8080`；
3. 点击 **【确认】** 创建；
4. 进入该网站的 **【HTTPS】** 设置标签页，点击申请免费 SSL 证书并开启 **【强制 HTTPS】**。

---

### 第三步：访问与服务入口

- **📱 移动端 / H5 前台（游戏与百宝箱）**：`https://你的域名/`
- **💻 PC 桌面端 Web 运营管理后台**：`https://你的域名/admin/`
  - **默认管理员账号**：`admin`
  - **默认管理员密码**：`admin123`

---

## 🔒 为什么采用 `127.0.0.2:8080` 绑定？
1. **彻底消除 502 报错**：1Panel 永远通过固定的 `127.0.0.2:8080` 连接容器，无论容器如何重启、升级重新分配虚拟 IP，都不会丢失连接；
2. **拒绝公网端口裸奔**：外部攻击者无法直接扫描或通过 `http://公网IP:8080` 绕过 1Panel 防火墙直连，所有访问必须经过 1Panel 的 SSL 加密与 WAF 规则；
3. **避免端口占用冲突**：在同一台服务器上部署多个微服务或项目时，可以分别使用 `127.0.0.2`、`127.0.0.3` 等独立地址，规划清晰。
