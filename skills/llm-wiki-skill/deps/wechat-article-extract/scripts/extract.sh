#!/bin/bash
# wechat-article-extract 封装脚本：调用 wechat-article-to-markdown 并归一化输出
set -euo pipefail

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "用法：bash extract.sh <WECHAT_URL>" >&2
  exit 1
fi

# 检查依赖
if ! command -v wechat-article-to-markdown >/dev/null 2>&1; then
  echo "错误：wechat-article-to-markdown 未安装" >&2
  echo "安装方式：uv tool install git+https://github.com/jackwener/wechat-article-to-markdown.git" >&2
  exit 1
fi

# 创建临时工作目录
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# 调用提取工具，指定输出到临时目录
wechat-article-to-markdown "$URL" -o "$WORK_DIR" || {
  echo "错误：微信文章提取失败" >&2
  exit 1
}

# 找到输出文件（output/<title>/<title>.md）
MD_FILE="$(find "$WORK_DIR" -name '*.md' -type f | head -1)"

if [ -z "$MD_FILE" ]; then
  echo "错误：提取成功但未找到 Markdown 输出文件" >&2
  exit 1
fi

# 输出内容到 stdout
cat "$MD_FILE"