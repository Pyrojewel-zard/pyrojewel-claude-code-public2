---
name: xiaohongshu-extract
description: |
  从小红书帖子 URL 或分享文本提取正文内容。使用 Playwright + Chromium 渲染页面，
  需要登录态（xhs_state.json）。输出纯文本或结构化数据。
  当用户提供 xiaohongshu.com 或 xhslink.com 链接，或小红书分享文本时触发。
  触发词：小红书、Xiaohongshu、RED、提取小红书、小红书帖子。
allowed-tools:
  - Bash
  - Read
  - Write
---

# 小红书帖子提取

从小红书帖子 URL 或分享文本提取正文内容。

## Script Directory

Scripts located in `scripts/` subdirectory.

**Path Resolution**:
1. `SKILL_DIR` = this SKILL.md's directory
2. Script path = `${SKILL_DIR}/scripts/<script-name>`

## 依赖检查

检查 uv 是否可用（extract.py 使用 uv run --script 模式）：

```bash
command -v uv >/dev/null 2>&1 && echo "uv_available" || echo "uv_missing"
```

如果 uv 缺失，提示安装：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

uv 会自动解析 PEP 723 inline metadata 中声明的依赖（playwright、requests、beautifulsoup4），无需手动 pip install。

首次运行时需要下载 Chromium 浏览器（约 150MB）：

```bash
uv run ${SKILL_DIR}/scripts/extract.py --install-browser
```

## 首次使用：登录态配置

小红书提取**需要登录态**。首次使用前必须完成以下步骤：

### 方式一：使用内置登录命令（推荐，需要图形界面）

```bash
uv run ${SKILL_DIR}/scripts/extract.py --login
```

脚本会启动 Playwright 浏览器，在弹出的窗口中扫码或手机号登录小红书。登录成功后自动保存 `xhs_state.json` 到 skill 目录。

> WSL 用户需要先配置 X11 转发：`export DISPLAY=:0`

### 方式二：手动登录

1. 克隆 xhs-extractor 并运行登录脚本：

```bash
git clone --depth 1 https://github.com/asimovVong/xhs-extractor.git /tmp/xhs-login-helper
cd /tmp/xhs-login-helper
pip install playwright
playwright install chromium
python -m xhs_extractor_module.xhs_login
```

2. 登录脚本会启动浏览器，扫码或手机号登录后自动保存 `xhs_state.json`
3. 将 `xhs_state.json` 复制到 `${SKILL_DIR}/scripts/` 目录下

```bash
cp xhs_state.json ${SKILL_DIR}/scripts/xhs_state.json
```

### 登录态管理

- **验证登录态**：`uv run ${SKILL_DIR}/scripts/extract.py --verify`
- **刷新登录态**：`uv run ${SKILL_DIR}/scripts/extract.py --refresh`（通过 headless 访问小红书来续期 cookie）
- **重新登录**：`uv run ${SKILL_DIR}/scripts/extract.py --login`
- 登录态超过 7 天未更新会自动尝试刷新
- 登录态通常可维持数天到数周，过期后需重新登录

## Usage

### 基本用法（纯文本输出）

```bash
uv run ${SKILL_DIR}/scripts/extract.py --text-only "<XHS_URL_OR_SHARE_TEXT>"
```

### 包含标题

```bash
uv run ${SKILL_DIR}/scripts/extract.py "<XHS_URL_OR_SHARE_TEXT>"
```

### 查看帮助

```bash
uv run ${SKILL_DIR}/scripts/extract.py --help
```

## 支持的输入格式

- `https://www.xiaohongshu.com/explore/<note_id>`
- `https://www.xiaohongshu.com/discovery/item/<note_id>`
- `https://xhslink.com/<short_code>`
- 小红书 App 分享文本（包含 URL 和提示文字的混合文本）

## 输出

- `--text-only` 模式：纯文本输出到 stdout（正文 + OCR 文本），无装饰，适合管道处理
- 默认模式：格式化输出到 stdout，包含标题、正文、统计信息
- 退出码：0 成功 / 1 失败

## 注意事项

- 必须先配置登录态（xhs_state.json），否则提取会失败
- 登录态会过期，过期后需要重新登录
- 部分帖子可能因隐私设置无法提取
- 提取失败时，建议用户从 App 或网页手动复制内容
- 可选安装 paddleocr + paddlepaddle 以支持图片文字识别（OCR）