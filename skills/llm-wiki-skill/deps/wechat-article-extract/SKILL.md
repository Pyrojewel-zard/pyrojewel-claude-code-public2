---
name: wechat-article-extract
description: |
  从微信公众号文章 URL 提取正文并转换为 Markdown。使用 Camoufox 反检测浏览器渲染页面，
  输出 Markdown 文件和本地化的图片。当用户提供 mp.weixin.qq.com 链接时触发。
  触发词：微信公众号、WeChat article、公众号文章、提取微信文章。
allowed-tools:
  - Bash
  - Read
  - Write
---

# 微信公众号文章提取

从微信公众号文章 URL 提取正文，输出干净的 Markdown 文件。

## Script Directory

Scripts located in `scripts/` subdirectory.

**Path Resolution**:
1. `SKILL_DIR` = this SKILL.md's directory
2. Script path = `${SKILL_DIR}/scripts/<script-name>`

## 依赖检查

先检查 `wechat-article-to-markdown` 是否可用：

```bash
command -v wechat-article-to-markdown >/dev/null 2>&1 && echo "available" || echo "not_installed"
```

如果返回 `not_installed`，检查 uv 是否可用：

```bash
command -v uv >/dev/null 2>&1 && echo "uv_available" || echo "uv_missing"
```

- 如果 uv 也缺失 → 提示用户安装 uv 后再安装工具
- 如果 uv 可用 → 提示用户安装：

```bash
uv tool install git+https://github.com/jackwener/wechat-article-to-markdown.git
```

## Usage

### 使用封装脚本（推荐）

```bash
bash ${SKILL_DIR}/scripts/extract.sh "<WECHAT_URL>"
```

封装脚本会：
1. 检查依赖是否可用
2. 调用 wechat-article-to-markdown 提取
3. 将 Markdown 内容输出到 stdout
4. 返回适当的退出码（0 成功 / 1 失败）

### 直接调用

```bash
wechat-article-to-markdown "<WECHAT_URL>"
```

注意：直接调用时，工具会在当前目录下创建 `output/<文章标题>/` 目录保存结果。

## 支持的 URL 格式

- `https://mp.weixin.qq.com/s/...`
- `https://mp.weixin.qq.com/s?__biz=...&mid=...&idx=...&sn=...`

工具会自动处理粘贴问题：去除包裹的引号/尖括号、解码 HTML 实体、补全 `https://` 协议。

## 输出

- 封装脚本 `extract.sh`：将 Markdown 内容输出到 stdout，便于管道处理
- 直接调用：在 `output/<文章标题>/` 目录下生成：
  - `<文章标题>.md` — Markdown 正文（标题 + 元数据 blockquote + 正文）
  - `images/` — 下载到本地的图片文件
- Markdown 格式：标题为 H1，元数据用 blockquote 呈现（公众号、发布时间、原文链接），正文前有 `---` 分隔

## 注意事项

- 使用 Camoufox 浏览器渲染，需要网络连接
- 部分文章可能有反爬限制，提取可能失败
- 提取失败时，建议用户在浏览器打开文章后手动复制全文
- 图片并发下载（最多 5 张同时），下载失败的图片保留远程 URL