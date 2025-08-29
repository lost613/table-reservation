# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 使用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# 复制构建文件到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
