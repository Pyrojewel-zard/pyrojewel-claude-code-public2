#!/usr/bin/env python3
"""批量并发读图:把一批图片喂给多模态 LLM,拿回每张图的结构化分析。

为什么存在:用 Claude Read 工具逐张读图会 stall(每张图一次往返,几十张图就
撞 180s 无进展阈值)。这个脚本用 asyncio+httpx 在单进程内并发,100 张图几秒
到几十秒搞定,结果落盘成 JSONL,下游(pyrojewel-paper / workflow / 人)直接消费。

配置来源(按优先级):
  1. 显式 --api-key/--api-base/--model 命令行参数
  2. 环境变量 VISION_API_KEY / VISION_API_BASE / VISION_MODEL
     (找不到时回退到 OPENAI_API_KEY / OPENAI_API_BASE / OPENAI_MODEL)
  3. --env-file 指定的 .env 文件(默认自动找当前目录 .env)

输出:
  --out 指定的 JSONL 文件,每行一条 {image, caption, content, key_data,
  support, raw, error}。已处理的图(同 --out 里已有 image 名)会跳过=断点续传。
  --md 可选:同时输出一份聚合 markdown 便于人读。

用法见 SKILL.md。
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

try:
    import httpx
except ImportError:
    sys.stderr.write("缺少 httpx,请: pip install httpx\n")
    raise

# ---------- 默认 prompt ----------

# 结构化 JSON 输出指令。这个 prompt 是 skill 的核心资产,改它要小心。
# 要求模型返回严格 JSON,字段固定,下游好解析。
DEFAULT_PROMPT = """你是 RF/集成电路论文的读图专家。仔细看这张图,返回严格 JSON(不要 markdown 代码块,不要多余文字),字段如下:

{
  "caption": "图的标题/编号,如 '图2-2 NFmin随手指宽度变化',看不出编号就概括图在讲什么",
  "content": "图展示了什么:2-3句,说清横纵轴、对象、趋势",
  "key_data": "关键数据/数值/结论,如 'NFmin在0.2mA/um最低','30GHz时MAG仅11dB'。无具体数据就写'无定量数据,定性为...'",
  "support": "这张图支撑论文哪个论点/机制,一句话。如 '支撑源极退化电感降低有效跨导'"
}

只返回 JSON 对象本身。"""


# ---------- env 加载 ----------

def load_env_file(path: str | None) -> dict[str, str]:
    """从 .env 文件读键值(不覆盖已有环境变量)。"""
    if path is None:
        return {}
    p = Path(path)
    if not p.exists():
        return {}
    out: dict[str, str] = {}
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def resolve_config(args: argparse.Namespace) -> dict[str, str]:
    """三优先级合并:命令行 > 环境变量 > .env 文件。"""
    env_file = args.env_file
    if env_file is None and Path(".env").exists():
        env_file = ".env"
    file_env = load_env_file(env_file)

    def pick(cli_val: str | None, env_keys: list[str]) -> str:
        if cli_val:
            return cli_val
        for k in env_keys:
            if os.environ.get(k):
                return os.environ[k]
        for k in env_keys:
            if file_env.get(k):
                return file_env[k]
        return ""

    api_key = pick(args.api_key, ["VISION_API_KEY", "OPENAI_API_KEY"])
    api_base = pick(args.api_base, ["VISION_API_BASE", "OPENAI_API_BASE"])
    model = pick(args.model, ["VISION_MODEL", "OPENAI_MODEL"])
    return {"api_key": api_key, "api_base": api_base, "model": model}


# ---------- 图片收集 ----------

IMAGE_EXTS = (".jpeg", ".jpg", ".png", ".webp", ".gif", ".bmp")


def collect_images(args: argparse.Namespace) -> list[Path]:
    """从目录/glob/显式列表收集要读的图片。"""
    imgs: list[Path] = []
    if args.dir:
        d = Path(args.dir)
        if not d.is_dir():
            sys.stderr.write(f"目录不存在: {d}\n")
            return []
        for f in sorted(d.iterdir()):
            if f.is_file() and f.suffix.lower() in IMAGE_EXTS:
                imgs.append(f)
    if args.images:
        for pat in args.images:
            p = Path(pat)
            if p.is_file():
                imgs.append(p)
            else:
                # 当 glob 处理
                import glob
                for hit in glob.glob(pat, recursive=True):
                    if Path(hit).suffix.lower() in IMAGE_EXTS:
                        imgs.append(Path(hit))
    # 去重保序
    seen: set[str] = set()
    uniq: list[Path] = []
    for p in imgs:
        s = str(p)
        if s not in seen:
            seen.add(s)
            uniq.append(p)
    return uniq


def filter_done(imgs: list[Path], out_path: Path) -> list[Path]:
    """断点续传:剔除已在 out_path 里成功的图。"""
    if not out_path.exists():
        return imgs
    done: set[str] = set()
    for line in out_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
            if rec.get("image") and not rec.get("error"):
                done.add(rec["image"])
        except Exception:
            continue
    return [p for p in imgs if str(p) not in done]


# ---------- 核心读图 ----------

JSON_FIX = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.MULTILINE)


def extract_json(text: str) -> dict[str, Any]:
    """从模型返回里抠 JSON 对象(容忍 ```json 包裹和前后多余文字)。"""
    s = text.strip()
    # 去 markdown 代码块
    if s.startswith("```"):
        s = JSON_FIX.sub("", s).strip()
    # 找第一个 { 到最后一个 }
    start = s.find("{")
    end = s.rfind("}")
    if start == -1 or end == -1 or end < start:
        return {"_raw": text}
    chunk = s[start : end + 1]
    try:
        return json.loads(chunk)
    except json.JSONDecodeError:
        # 容忍尾逗号
        chunk2 = re.sub(r",(\s*[}\]])", r"\1", chunk)
        try:
            return json.loads(chunk2)
        except json.JSONDecodeError:
            return {"_raw": text}


async def read_one(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    img: Path,
    cfg: dict[str, str],
    prompt: str,
    max_tokens: int,
    idx: int,
    total: int,
    out_path: Path,
    out_lock: asyncio.Lock,
) -> dict[str, Any]:
    """读一张图,成功就即时落盘(锁保护,避免并发写交错)。"""
    async with sem:
        name = img.name
        sys.stderr.write(f"[{idx}/{total}] {name} ...\n")
        try:
            b64 = base64.b64encode(img.read_bytes()).decode()
            suffix = img.suffix.lower().lstrip(".") or "jpeg"
            if suffix == "jpg":
                suffix = "jpeg"
            payload = {
                "model": cfg["model"],
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/{suffix};base64,{b64}"},
                            },
                        ],
                    }
                ],
                "max_tokens": max_tokens,
            }
            url = cfg["api_base"].rstrip("/") + "/chat/completions"
            r = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {cfg['api_key']}",
                    "Content-Type": "application/json",
                },
                timeout=120,
            )
            r.raise_for_status()
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            parsed = extract_json(content)
            rec: dict[str, Any] = {
                "image": str(img),
                "image_name": name,
                "caption": parsed.get("caption", ""),
                "content": parsed.get("content", ""),
                "key_data": parsed.get("key_data", ""),
                "support": parsed.get("support", ""),
                "model": cfg["model"],
            }
            if "_raw" in parsed:
                rec["raw"] = parsed["_raw"]
        except Exception as e:
            rec = {"image": str(img), "image_name": name, "error": f"{type(e).__name__}: {e}"}
            sys.stderr.write(f"[{idx}/{total}] {name} 失败: {e}\n")

        # 即时落盘(锁)
        async with out_lock:
            with out_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        return rec


# ---------- markdown 聚合 ----------

def to_markdown(records: list[dict], md_path: Path) -> None:
    """把结果聚合成一份人可读 markdown。"""
    lines: list[str] = ["# 批量读图结果", ""]
    for rec in records:
        name = rec.get("image_name", rec.get("image", ""))
        if rec.get("error"):
            lines += [f"## {name}", "", f"**读取失败**: {rec['error']}", ""]
            continue
        lines += [
            f"## {name}",
            "",
            f"**图注**: {rec.get('caption', '')}",
            "",
            f"**内容**: {rec.get('content', '')}",
            "",
            f"**关键数据**: {rec.get('key_data', '')}",
            "",
            f"**支撑论点**: {rec.get('support', '')}",
            "",
        ]
    md_path.write_text("\n".join(lines), encoding="utf-8")


# ---------- 主 ----------

async def main_async(args: argparse.Namespace) -> int:
    cfg = resolve_config(args)
    missing = [k for k, v in cfg.items() if not v]
    if missing:
        sys.stderr.write(
            f"缺少配置: {missing}。用 --api-key/--api-base/--model 或设环境变量 "
            f"VISION_API_KEY/VISION_API_BASE/VISION_MODEL,或放 .env 文件。\n"
        )
        return 2

    imgs = collect_images(args)
    if not imgs:
        sys.stderr.write("没找到图片。检查 --dir / --images。\n")
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    todo = filter_done(imgs, out_path)
    skipped = len(imgs) - len(todo)
    sys.stderr.write(
        f"共 {len(imgs)} 张,跳过已完成 {skipped},待读 {len(todo)}。\n"
        f"模型={cfg['model']} base={cfg['api_base']} out={out_path}\n"
    )
    if not todo:
        sys.stderr.write("全部已读,无待办。\n")
    else:
        sem = asyncio.Semaphore(args.concurrency)
        out_lock = asyncio.Lock()
        limits = httpx.Limits(max_connections=args.concurrency)
        async with httpx.AsyncClient(limits=limits, verify=args.verify_ssl) as client:
            tasks = [
                read_one(
                    client, sem, img, cfg, args.prompt_from_file or DEFAULT_PROMPT,
                    args.max_tokens, i + 1, len(todo), out_path, out_lock,
                )
                for i, img in enumerate(todo)
            ]
            records = await asyncio.gather(*tasks)
    # 读回全部(含续传的)写 md
    if args.md:
        all_recs = []
        if out_path.exists():
            for line in out_path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    try:
                        all_recs.append(json.loads(line))
                    except Exception:
                        pass
        to_markdown(all_recs, Path(args.md))
        sys.stderr.write(f"markdown 已写: {args.md}\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(
        description="批量并发读图:多模态 LLM 读一批图片,输出结构化 JSON 分析。",
    )
    ap.add_argument("--dir", help="图片目录,读该目录全部图片")
    ap.add_argument("--images", nargs="*", help="图片文件或 glob 模式列表")
    ap.add_argument("--out", required=True, help="输出 JSONL 路径(断点续传依据)")
    ap.add_argument("--md", help="可选:同时输出聚合 markdown 到此路径")
    ap.add_argument("--concurrency", type=int, default=8, help="并发数,默认 8")
    ap.add_argument("--max-tokens", type=int, default=300, help="每张图回答 max_tokens,默认 300")
    ap.add_argument("--prompt-from-file", help="从文件读自定义 prompt 覆盖默认")
    ap.add_argument("--env-file", help=".env 文件路径,默认当前目录 .env")
    ap.add_argument("--api-key", help="API key(也可用环境变量 VISION_API_KEY/OPENAI_API_KEY)")
    ap.add_argument("--api-base", help="API base(也可用 VISION_API_BASE/OPENAI_API_BASE)")
    ap.add_argument("--model", help="模型名(也可用 VISION_MODEL/OPENAI_MODEL)")
    ap.add_argument("--verify-ssl", action="store_true", help="校验 SSL(默认不校验,内网常见自签)")
    args = ap.parse_args()

    prompt = None
    if args.prompt_from_file:
        prompt = Path(args.prompt_from_file).read_text(encoding="utf-8")
        args.prompt_from_file = prompt

    return asyncio.run(main_async(args))


if __name__ == "__main__":
    raise SystemExit(main())
