# Table Reservation System

一个基于 NestJS (后端) 和 SolidJS (前端) 的餐桌预订系统，使用 Couchbase 作为数据库，支持 Docker 部署。

## 项目结构

```
table-reservation/
├── backend/          # NestJS 后端服务
├── frontend/         # SolidJS 前端应用
├── db/              # Couchbase 数据库文件
├── docker-compose.yml
└── package.json     # 根目录脚本管理
```

## 技术栈

- **后端**: NestJS, GraphQL, TypeScript
- **前端**: SolidJS, TypeScript, Vite
- **数据库**: Couchbase
- **容器化**: Docker, Docker Compose
- **包管理**: PNPM

## 快速开始

### 前置要求

- Node.js (推荐 LTS 版本)
- PNPM
- Docker 和 Docker Compose (可选，用于容器化部署)

### 安装依赖

```bash
# 安装所有依赖 (前端 + 后端)
pnpm install:all

# 或分别安装
pnpm install:backend  # 仅安装后端依赖
pnpm install:frontend # 仅安装前端依赖
```

### 开发环境运行

```bash
# 同时启动前后端开发服务器
pnpm start:all

# 或分别启动
pnpm start:backend   # 启动后端开发服务器
pnpm start:frontend  # 启动前端开发服务器
```

访问地址：
- 前端应用: http://localhost:3000 (SolidJS)
- 后端API: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql

### 构建项目

```bash
# 构建所有项目
pnpm build:all

# 或分别构建
pnpm build:backend   # 构建后端
pnpm build:frontend  # 构建前端
```

### 运行测试

```bash
# 运行所有测试
pnpm test:all

# 或分别运行
pnpm test:backend    # 运行后端测试
pnpm test:frontend   # 运行前端测试
```

## 开发环境初始化

下面步骤用于在本地开发时准备 Couchbase 与管理员账号。

1) 使用 Docker 部署 Couchbase 容器

```bash
docker-compose up -d couchbase
```

2) 初始化 Couchbase（参考官方文档）

- 官方 Quickstart: https://hub.docker.com/_/couchbase#quickstart-with-couchbase-server-and-docker
- 启动容器后，访问 http://localhost:8091 进入 Couchbase Web 控制台，按照引导完成集群初始化（设置管理员、内存配额、等）。
- 创建 Bucket：table-reservation，并记录连接信息以便后端配置。

3) 初始化管理员账号（二选一）

- 方式A：登录 Couchbase 网页版，直接插入新用户数据，将其设为管理员。
- 方式B：项目整体启动后，先在前端正常注册一个普通用户，然后到 Couchbase 网页版将该用户修改为管理员。

> 注意：用户数据中 isEmployee 字段为 true 时，表示该用户为管理员身份。

## Docker 部署

### 使用 Docker Compose

```bash
# 构建 Docker 镜像
pnpm docker:build

# 启动所有服务 (后台运行)
pnpm docker:up

# 停止并移除容器
pnpm docker:down
```

### 手动 Docker 命令

```bash
# 构建并启动
docker-compose up --build

# 仅启动 (使用已构建的镜像)
docker-compose up

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down

# 停止并移除数据卷
docker-compose down -v
```

## 项目功能

### 后端功能 (NestJS)
- 用户认证和授权
- 餐桌预订管理
- GraphQL API
- Couchbase 数据库集成
- JWT 认证
- 数据验证和错误处理

### 前端功能 (SolidJS)
- 用户界面
- 预订管理
- 响应式设计
- 与后端 API 集成

## 开发指南

### 后端开发

```bash
cd backend

# 开发模式启动
pnpm start:dev

# 生产模式启动
pnpm start:prod

# 监视模式启动
pnpm start:debug
```

### 前端开发

```bash
cd frontend

# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 环境变量

### 后端环境变量
创建 `backend/.env` 文件：

```env
# 数据库配置
COUCHBASE_CONNECT_OPTIONS=couchbase://localhost/table-reservation@admin:123456

# JWT 配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# 应用配置
PORT=4000
NODE_ENV=development
```

### 前端环境变量
创建 `frontend/.env` 文件：

```env
VITE_API_URL=/api
```

## API 文档

### GraphQL
访问 http://localhost:4000/graphql 查看 GraphQL Playground 和 API 文档。

### 主要端点
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- GraphQL endpoint: `/graphql`

## 故障排除

### 常见问题

1. **端口冲突**
   - 确保端口 4000 (后端) 和 3000 (前端) 未被占用
   - SolidJS 开发服务器默认运行在 3000 端口

2. **依赖安装失败**
   ```bash
   # 清除缓存并重新安装
   pnpm store prune
   pnpm install:all
   ```

3. **Couchbase 连接问题**
   - 确保 Couchbase 服务正在运行
   - 检查环境变量配置

4. **Docker 问题**
   ```bash
   # 重新构建镜像
   docker-compose build --no-cache
   
   # 清理未使用的容器和镜像
   docker system prune
   ```
