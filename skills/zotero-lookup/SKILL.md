---
name: zotero-lookup
description: 'Use when needing to locate a Zotero paper directory by attachmentKey or keyword, or to resolve content.md / PDF paths. Trigger: attachmentKey lookup, paper path resolution, "find paper folder", "where is this paper", any time code needs to read content.md from Zotero storage.'
user_invocable: false
version: "1.0.0"
---

# zotero-lookup: 论文速查

通过 attachmentKey 或关键词秒级定位 Zotero 论文文件夹。

## Constants

- **BASE** = `$ZOTERO_MARKDOWN_PATH` (required; set it to the Zotero markdown export directory)
- **INDEX** = `$BASE/.zotero_lookup_index.json`
- **SCRIPT** = `scripts/zotero-lookup.sh`, bundled with this skill

## Flow

### 给定 attachmentKey（8位字母数字，如 `222T4HRB`）

直接拼接，不调脚本不查索引：

```
content.md:  $BASE/<key>/content.md
PDF:         $BASE/<key>/*.pdf
images:      $BASE/<key>/*.jpeg
meta:        $BASE/<key>/*_meta.json
```

### 给定关键词（非8位key，如 "GCN"、"Circuit Designer"）

以下命令从 `zotero-lookup` skill 目录（包含本文件的目录）执行。

```bash
bash scripts/zotero-lookup.sh "<keyword>"
```

返回 `key<TAB>pdf_name<TAB>title` 的匹配行。拿到 key 后按上节拼路径。

### 重建索引（新增论文后）

```bash
bash scripts/zotero-lookup.sh build
```

## Reference

- `zotero-lookup --pdf <key>` → PDF 完整路径
- `zotero-lookup --md <key>` → content.md 完整路径
- `zotero-lookup ls` → 列出全部条目
- `zotero-lookup fzf` → 交互式搜索（需 fzf）

## Performance

jq 索引查询 <1ms vs find 遍历 ~300ms（4527目录冷缓存）。支持 key/pdf/title 三字段模糊搜索。
