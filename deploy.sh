#!/bin/bash

# 拉取最新代码
git pull

# 构建并重启容器
docker-compose down
docker-compose build
docker-compose up -d

# 清理未使用的镜像
docker image prune -f