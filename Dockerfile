# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine

# 设置 npm 和 pnpm 镜像
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

# 设置工作目录
WORKDIR /app

# 复制包管理相关文件
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装依赖（只需要执行一次）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 7788

# 启动应用
CMD ["pnpm", "start"] 