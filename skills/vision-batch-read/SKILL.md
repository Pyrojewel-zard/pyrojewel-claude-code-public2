---
name: vision-batch-read
description: 批量并发读图。把一批图片(论文图/截图/电路图/曲线图)喂给多模态 LLM,拿回每张图的结构化 JSON 分析(图注/内容/关键数据/支撑论点)。用 asyncio+httpx 单进程并发,几十上百张图几十秒搞定,绕开 Claude Read 工具逐张读图的 stall 瓶颈。触发词:批量读图、并发读图、读论文图、image batch、读图分析、vision batch。
trigger:
  - "批量读图"
  - "并发读图"
  - "读论文图"
  - "读图分析"
  - "批量分析图片"
  - "image batch"
  - "vision batch"
argument-hint: "[--dir <图目录> | --images <文件...>] --out <输出.jsonl>"
user_invocable: true
version: "1.0.0"
allowed-tools: Bash(*), Read, Write
---

# vision-batch-read: 批量并发读图

把一堆图片丢给多模态 LLM,拿回结构化分析。为「读图爆炸」而生。

## 为什么存在

用 Claude 的 Read 工具逐张读图,每张一次往返。论文一章 30 张图,读到一半就撞 workflow 的 180s 无进展阈值(stall),整批失败重试又从头读。这个脚本在单进程内 asyncio 并发,8-16 张同时读,30 张图 20 秒,结果落盘成 JSONL,断点续传,下游直接消费。

## 前置:配置 LLM

需要 OpenAI 兼容的多模态 LLM(支持 `image_url` 输入)。三选一配置:

**方式 1:本 skill 目录放 `.env`**(复制模板)
```bash
cd <skill目录>
cp .env.example .env
# 编辑 .env 填入 VISION_API_KEY / VISION_API_BASE / VISION_MODEL
```

**方式 2:用项目已有的 `.env`**(若项目已有 `OPENAI_API_KEY/BASE/MODEL`)
```bash
# 脚本会自动找当前目录 .env,回退用 OPENAI_* 变量,无需额外配置
```

**方式 3:环境变量**
```bash
export VISION_API_KEY='...'
export VISION_API_BASE='https://maas-api.cn-huabei-1.xf-yun.com/v2'
export VISION_MODEL='xopqwen35v35b'
```

> 配置优先级:命令行 `--api-key/--api-base/--model` > `VISION_*` 环境变量 > `OPENAI_*` 环境变量 > `.env` 文件。
> `.env` 含真实 key,**已被 .gitignore**,不会进 git。仓库只有 `.env.example` 占位模板。

## 用法

```bash
SCRIPT="<skill目录>/scripts/batch_read.py"

# 读一个目录的全部图
python3 "$SCRIPT" --dir notes/papers/images/CGFABZT6/ \
  --out notes/papers/images/CGFABZT6/_analysis.jsonl \
  --md notes/papers/images/CGFABZT6/_analysis.md

# 只读指定几张图
python3 "$SCRIPT" --images img1.jpeg img2.jpeg \
  --out out.jsonl

# 自定义 prompt(见 references/prompt-templates.md)
python3 "$SCRIPT" --dir imgs/ --out out.jsonl \
  --prompt-from-file my_prompt.txt --max-tokens 400

# 加大并发(注意 API 限流)
python3 "$SCRIPT" --dir imgs/ --out out.jsonl --concurrency 16
```

## 参数

| 参数 | 默认 | 说明 |
|------|------|------|
| `--dir` | - | 图片目录,读该目录全部图片 |
| `--images` | - | 图片文件或 glob 模式列表(可与 --dir 并用) |
| `--out` | **必填** | 输出 JSONL 路径,也作断点续传依据 |
| `--md` | - | 可选:同时输出聚合 markdown |
| `--concurrency` | 8 | 并发数 |
| `--max-tokens` | 300 | 每张图回答的 max_tokens |
| `--prompt-from-file` | - | 自定义 prompt 文件,覆盖默认 |
| `--env-file` | .env | env 文件路径 |
| `--api-key/--api-base/--model` | - | 显式覆盖配置 |
| `--verify-ssl` | off | 校验 SSL(内网自签证书默认关) |

## 输出格式(JSONL,每行一条)

```json
{
  "image": "/abs/path/to/image00013.jpeg",
  "image_name": "image00013.jpeg",
  "caption": "图2-2 NFmin随手指宽度变化",
  "content": "横轴手指宽度,纵轴NFmin,U型曲线",
  "key_data": "叉指宽度2um时NFmin最低",
  "support": "支撑源极退化降低有效跨导",
  "model": "xopqwen35v35b"
}
```

失败行:`{"image": "...", "image_name": "...", "error": "..."}`,重跑时自动重试失败的。

## 断点续传

`--out` 文件里已有的成功记录会被跳过。中断后重跑同一命令,只处理没完成的。要强制重读全部,删掉 `--out` 文件再跑。

## Prompt 模板

默认 prompt 返回 4 字段 JSON(caption/content/key_data/support),对齐 ljg-paper 阅读笔记中的图件证据节。
其他场景(通用图/只取图注/电路原理图/仿真曲线)的模板见 [`references/prompt-templates.md`](references/prompt-templates.md),`--prompt-from-file` 传入。

所有模板要求**严格 JSON 输出**,脚本内置 `extract_json` 兜底(容忍 ```json 包裹和尾逗号),但别依赖它。

## 和 ljg-paper 怎么配合

ljg-paper 的阅读笔记需要为引用图保留证据说明。当一章图很多(>10 张)时,让 Claude 用 Read 工具逐张读会 stall。

推荐流程:
1. 先用本 skill 批量读该章引用的图 → 拿到 JSONL
2. ljg-paper 整理时,Claude 直接 Read 这个 JSONL 文件(一次读全部分析),不再逐张读图
3. 笔记的 Key Figures 节直接引用 JSONL 里的 caption/content/analysis

这样把「读图」从 Claude 上下文里搬出去,交给本 skill 的并发 LLM,Claude 只消费结果。

## 依赖

```bash
pip install httpx
```

## 已知限制

- 模型读图质量取决于模型。`xopqwen35v35b` 能识别 RF 曲线趋势和电路拓扑,但极精细数值(小数点后两位)可能不准。关键数值以论文正文为准。
- base64 内嵌图,单张别太大(>5MB 会拖慢且可能超 API 限制),论文图一般几十 KB 没问题。
- 并发数受 API 限流约束,撞限流就降 `--concurrency`。失败行会重试。
