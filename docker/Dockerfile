# 阶段 1：多阶段构建 Node.js 编译环境
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 编译 PC Web 管理后台与 H5 移动前台
RUN npm run build:admin
RUN npm run build:h5

# 阶段 2：轻量级 Nginx 运行时镜像
FROM nginx:alpine

# 拷贝 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建产物
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html/h5
COPY --from=builder /app/dist-admin /usr/share/nginx/html/admin

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
