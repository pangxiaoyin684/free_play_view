# 🚀 1Panel 运维面板极速部署指南 (free-play-view)

本文档介绍如何在 **1Panel 服务器运维面板** 中使用 Docker Compose 一键部署 **休闲游戏与多功能百宝箱平台**。

---

## 📋 部署准备信息

| 项目 | 参数值 |
| :--- | :--- |
| **容器镜像 (ACR)** | `crpi-vrso5s2zv7dk1hk1.cn-wulanchabu.personal.cr.aliyuncs.com/pangxiaoyin/free-play-view:latest` |
| **默认容器端口** | `80` (内部 Nginx：`/` 对应移动前台，`/admin/` 对应 PC 管理后台) |
| **默认宿主机映射端口** | `8080` (可按需修改) |

---

## ⚡ 1Panel 部署步骤（两分钟完成）

### 第一步：配置镜像仓库访问凭证（可选，如为私有镜像）
1. 登录 1Panel 面板，进入 **【容器】 -> 【仓库】 -> 【创建仓库】**；
2. 填写信息：
   - **名称**：`aliyun-acr`
   - **下载地址**：`crpi-vrso5s2zv7dk1hk1.cn-wulanchabu.personal.cr.aliyuncs.com`
   - **用户名**：你的阿里云 ACR 账号
   - **密码**：你的阿里云 ACR 固定密码
3. 点击 **【确认】** 保存。

---

### 第二步：创建 1Panel 容器编排 (Compose)
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
      - "8080:80"
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

### 第三步：访问与验证

容器运行成功后，在浏览器访问服务器 IP 或已解析域名：

- **📱 移动端 / H5 前台游戏百宝箱**：`http://你的服务器IP:8080/`
- **💻 PC 桌面端 Web 运营管理后台**：`http://你的服务器IP:8080/admin/`
  - 默认管理员账号：`admin`
  - 默认管理员密码：`admin123`

---

## 🌐 进阶：配置域名与 SSL 证书（反向代理）

若需绑定自己的正式域名并启用 HTTPS：
1. 进入 1Panel **【网站】 -> 【创建网站】 -> 【反向代理】**；
2. **主域名**：填写你的域名（例如 `game.yourdomain.com`）；
3. **代理地址**：`127.0.0.1:8080`；
4. 点击 **【确认】**；
5. 进入该网站的 **【HTTPS】** 设置，申请免费 Let's Encrypt 证书并开启 **强制 HTTPS**。
