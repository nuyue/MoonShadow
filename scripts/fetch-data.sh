#!/bin/bash
# 从私有仓库拉取数据的脚本

set -e

DATA_REPO_URL="${DATA_REPO_URL:-https://github.com/nuyue/MoonShadow-Data}"
DATA_REPO_TOKEN="${DATA_REPO_TOKEN:-}"

echo "=== MoonShadow Data Fetch Script ==="

# 检查是否配置了 token
if [ -z "$DATA_REPO_TOKEN" ]; then
  echo "No DATA_REPO_TOKEN configured, using local example data."
  exit 0
fi

echo "Fetching data from private repository..."

# 构建带认证的 URL
if [[ "$DATA_REPO_URL" == https://github.com/* ]]; then
  AUTH_URL="${DATA_REPO_URL/https:\/\//https:\/\/${DATA_REPO_TOKEN}@}"
else
  AUTH_URL="$DATA_REPO_URL"
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 克隆私有仓库
git clone --depth 1 "$AUTH_URL" "$TEMP_DIR" 2>&1 | sed 's/'"$DATA_REPO_TOKEN"'/****/g'

echo "Copying data files..."

# 复制文章数据
if [ -d "$TEMP_DIR/articles" ]; then
  echo "  - Copying articles..."
  rm -rf articles/*
  cp -r "$TEMP_DIR/articles"/* articles/ 2>/dev/null || true
fi

# 复制音乐数据
if [ -d "$TEMP_DIR/music" ]; then
  echo "  - Copying music..."
  rm -rf music/*
  cp -r "$TEMP_DIR/music"/* music/ 2>/dev/null || true
fi

# 复制友链数据
if [ -f "$TEMP_DIR/links.json" ]; then
  echo "  - Copying links..."
  cp "$TEMP_DIR/links.json" src/data/links.json
fi

# 复制工具数据
if [ -f "$TEMP_DIR/tools.json" ]; then
  echo "  - Copying tools..."
  cp "$TEMP_DIR/tools.json" src/data/tools.json
fi

echo "Data fetch completed!"
