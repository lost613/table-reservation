# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 只安装生产依赖
RUN pnpm install --prod

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:prod"]
