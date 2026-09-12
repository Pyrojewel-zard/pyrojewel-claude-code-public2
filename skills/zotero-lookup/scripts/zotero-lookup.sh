#!/usr/bin/env bash
# ============================================================
# zotero-lookup — Zotero 论文速查表
# 用法:
#   zotero-lookup build                 构建/重建 JSON 索引
#   zotero-lookup <query>               多 token 模糊搜索 (AND 语义)
#   zotero-lookup ls                    列出所有索引条目
#   zotero-lookup --pdf <key>           输出 PDF 完整路径
#   zotero-lookup --md <key>            输出 content.md 完整路径
#   zotero-lookup --first <query>       只返回第一条匹配
#   zotero-lookup --key <query>         只按 attachmentKey 搜索
#   zotero-lookup --author <name>       按作者名搜索
#   zotero-lookup --year <YYYY>         按年份搜索
# ============================================================

set -euo pipefail

BASE="${ZOTERO_MARKDOWN_PATH:-}"
if [[ -z "$BASE" ]]; then
    echo "请先设置 ZOTERO_MARKDOWN_PATH 为 Zotero markdown export 目录" >&2
    exit 2
fi
INDEX_FILE="$BASE/.zotero_lookup_index.json"
LF=$'\n'

# ── 安全访问索引 ──────────────────────────────────────────────────
require_index() {
    if [[ ! -f "$INDEX_FILE" ]]; then
        echo "索引不存在，请先运行: zotero-lookup build" >&2
        exit 1
    fi
}

# ── build: 扫描 BASE 目录，生成 JSON 索引 ──────────────────────────
cmd_build() {
    local tmpfile="$INDEX_FILE.tmp"
    printf '[\n' > "$tmpfile"
    local first=true

    for dir in "$BASE"/*/; do
        key=$(basename "$dir")
        [[ "$key" == .* ]] && continue
        [[ "$key" == @eaDir ]] && continue

        # 取第一个 pdf 文件名
        local pdf_name=""
        for f in "$dir"*.pdf; do
            [[ -f "$f" ]] || continue
            pdf_name=$(basename "$f" .pdf)
            break
        done

        # 取 meta.json 中的 title
        local title=""
        for m in "$dir"*_meta.json; do
            [[ -f "$m" ]] || continue
            title=$(jq -r '(.table_of_contents // []) | .[0].title // empty' "$m" 2>/dev/null || true)
            break
        done

        # 从 pdf 文件名提取年份和作者（格式: "YYYY_Author et al_Title..." 或 "YYYY_Author_..."）
        local year="" author=""
        if [[ "$pdf_name" =~ ^([0-9]{4})_(.+)$ ]]; then
            year="${BASH_REMATCH[1]}"
            local rest="${BASH_REMATCH[2]}"
            # 作者在第一个下划线到 " et al" 或下一个下划线之间
            if [[ "$rest" =~ ^([^_]+)(_et\ al|_) ]]; then
                author="${BASH_REMATCH[1]}"
            fi
        fi

        # JSON 安全转义
        pdf_name=$(jq -n --arg v "$pdf_name" '$v')
        title=$(jq -n --arg v "$title" '$v')
        author=$(jq -n --arg v "$author" '$v')

        if $first; then
            first=false
        else
            printf ',\n' >> "$tmpfile"
        fi
        printf '  {"key": "%s", "pdf": %s, "title": %s, "year": "%s", "author": %s, "path": "%s"}' \
            "$key" "$pdf_name" "$title" "$year" "$author" "$dir" >> "$tmpfile"
    done

    printf '\n]\n' >> "$tmpfile"
    mv "$tmpfile" "$INDEX_FILE"
    local count=$(jq 'length' "$INDEX_FILE")
    echo "索引已构建: $count 条记录 → $INDEX_FILE"
}

# ── 交互式模糊搜索（fzf）──────────────────────────────────────────
cmd_fzf() {
    require_index
    jq -r '.[] | "\(.key)\t\(.pdf)\t\(.title // "")"' "$INDEX_FILE" \
        | fzf --delimiter='\t' \
              --with-nth=2,3 \
              --preview="echo -e 'Key: {1}\nPDF: {2}\nPath: $BASE/{1}/'" \
              --preview-window=up:3:wrap \
              --header="AttachmentKey | PDF 名称 | 标题" \
              --bind="enter:accept-or-print-query" \
              | cut -f1
}

# ── ls: 列出全部条目 ──────────────────────────────────────────────
cmd_ls() {
    require_index
    jq -r '.[] | "\(.key)\t\(.pdf)"' "$INDEX_FILE" | column -t -s $'\t'
}

# ── 构建 jq filter: 多 token AND 语义，每个 token 在 key/pdf/title 任意字段命中 ─
# 用法: build_filter "<query_string>" [--only-key] [--only-pdf] [--only-title]
build_filter() {
    local q="$1" mode="${2:-all}"

    # 按空白拆成多个 token
    local tokens=() token
    IFS=' ' read -ra raw_tokens <<< "$q"
    for token in "${raw_tokens[@]}"; do
        [[ -z "$token" ]] && continue
        tokens+=("$token")
    done

    if [[ ${#tokens[@]} -eq 0 ]]; then
        echo 'true'
        return
    fi

    local parts=()
    case "$mode" in
        only-key)   local fields=".key" ;;
        only-pdf)   local fields=".pdf" ;;
        only-title) local fields=".title" ;;
        *)          local fields="(.key + \"|\" + .pdf + \"|\" + .title)" ;;
    esac

    for token in "${tokens[@]}"; do
        # 每个 token 对合并字段做不区分大小写的包含匹配 (test 是正则，需转义特殊字符)
        local escaped
        escaped=$(printf '%s' "$token" | sed 's/[.[\*^$()+?{|]/\\&/g')
        parts+=("($fields | test(\"$escaped\"; \"i\"))")
    done

    # AND 连接: 所有 token 都必须命中
    if [[ ${#parts[@]} -eq 1 ]]; then
        echo "${parts[0]}"
    else
        local result="" sep=""
        for cond in "${parts[@]}"; do
            result+="${sep}${cond}"
            sep=" and "
        done
        echo "$result"
    fi
}

# ── search: 多 token 模糊搜索 ─────────────────────────────────────
cmd_search() {
    local q="$1"
    local mode="${2:-all}"
    require_index

    # 先尝试精确 key 匹配 (仅默认模式)
    if [[ "$mode" == "all" ]]; then
        local exact
        exact=$(jq -r --arg q "$q" '.[] | select(.key == $q) | "\(.key)\t\(.pdf)\t\(.title // "")"' "$INDEX_FILE")
        if [[ -n "$exact" ]]; then
            echo "$exact"
            return
        fi
    fi

    local filter
    filter=$(build_filter "$q" "$mode")
    local results
    results=$(jq -r "[.[] | select($filter)] | .[0:30] | .[] | \"\(.key)\t\(.pdf)\t\(.title // \"\")\"" "$INDEX_FILE")

    if [[ -z "$results" ]]; then
        echo "未找到匹配: $q" >&2
        exit 1
    fi
    echo "$results"
}

# ── --first: 只返回第一条匹配 ─────────────────────────────────────
cmd_search_first() {
    local q="$1" mode="${2:-all}" results
    results=$(cmd_search "$q" "$mode")
    head -1 <<< "$results"
}

# ── --key: 只按 attachmentKey 搜索 ─────────────────────────────────
cmd_search_key() {
    cmd_search "$1" "only-key"
}

# ── --author: 按作者搜索 ──────────────────────────────────────────
cmd_search_author() {
    require_index
    local q="$1"
    q=$(printf '%s' "$q" | sed 's/[.[\*^$()+?{|]/\\&/g')
    jq -r --arg q "$q" '.[] | select(.author | test($q; "i")) | "\(.key)\t\(.pdf)\t\(.title // "")"' "$INDEX_FILE"
}

# ── --year: 按年份精确搜索 ────────────────────────────────────────
cmd_search_year() {
    require_index
    local y="$1"
    jq -r --arg y "$y" '.[] | select(.year == $y) | "\(.key)\t\(.pdf)\t\(.title // "")"' "$INDEX_FILE"
}

# ── --pdf: 获取 PDF 完整路径 ──────────────────────────────────────
cmd_pdf_path() {
    local key="$1"
    # 不强制索引 — 直接文件系统验证
    if [[ -d "$BASE/$key" ]]; then
        for f in "$BASE/$key"/*.pdf; do
            [[ -f "$f" ]] || continue
            echo "$f"
            return
        done
    fi
    echo "未找到 key: $key" >&2
    exit 1
}

# ── --md: 获取 content.md 完整路径 ────────────────────────────────
cmd_md_path() {
    local key="$1"
    if [[ -f "$BASE/$key/content.md" ]]; then
        echo "$BASE/$key/content.md"
    else
        echo "content.md 不存在: $BASE/$key/" >&2
        exit 1
    fi
}

# ── --dir: 获取目录路径 ──────────────────────────────────────────────
cmd_dir_path() {
    local key="$1"
    if [[ -d "$BASE/$key" ]]; then
        echo "$BASE/$key/"
    else
        echo "目录不存在: $BASE/$key/" >&2
        exit 1
    fi
}

# ── --info: 获取单条完整信息 ──────────────────────────────────────
cmd_info() {
    local key="$1"
    require_index
    jq --arg k "$key" '.[] | select(.key == $k)' "$INDEX_FILE"
}

# ── main ──────────────────────────────────────────────────────────
case "${1:-}" in
    build)
        cmd_build
        ;;
    ls|list)
        cmd_ls
        ;;
    fzf)
        cmd_fzf
        ;;
    --pdf)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --pdf <key>" >&2; exit 1; }
        cmd_pdf_path "$2"
        ;;
    --md)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --md <key>" >&2; exit 1; }
        cmd_md_path "$2"
        ;;
    --dir)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --dir <key>" >&2; exit 1; }
        cmd_dir_path "$2"
        ;;
    --info)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --info <key>" >&2; exit 1; }
        cmd_info "$2"
        ;;
    --first)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --first <query>" >&2; exit 1; }
        cmd_search_first "$2" "all"
        ;;
    --key)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --key <query>" >&2; exit 1; }
        cmd_search_key "$2"
        ;;
    --author)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --author <name>" >&2; exit 1; }
        cmd_search_author "$2"
        ;;
    --year)
        [[ -z "${2:-}" ]] && { echo "用法: zotero-lookup --year <YYYY>" >&2; exit 1; }
        cmd_search_year "$2"
        ;;
    -h|--help|"")
        cat << 'HELP'
用法: zotero-lookup {<query>|子命令}

搜索模式 (默认: 多 token AND 模糊搜索):
  <query>                    空格分隔多 token，全部命中才返回 (AND 语义)
  --first <query>            只返回第一条匹配
  --key <query>              只按 attachmentKey 搜索
  --author <name>            只按作者搜索 (不区分大小写)
  --year <YYYY>              按年份精确搜索

路径输出:
  --pdf <key>                输出 PDF 完整路径
  --md <key>                 输出 content.md 完整路径
  --dir <key>                输出论文目录路径
  --info <key>               输出完整 JSON 记录

索引管理:
  build                      构建/重建索引
  ls                         列出所有条目 (key | pdf)
  fzf                        交互式模糊搜索

示例:
  zotero-lookup "GCN analog circuit"    # 三个 token 全部匹配
  zotero-lookup --first "graph neural"  # 第一条匹配
  zotero-lookup --author "Koziel"       # 按作者查
  zotero-lookup --year 2024             # 2024年的论文
  zotero-lookup --pdf 222T4HRB          # 输出 PDF 完整路径
HELP
        ;;
    *)
        cmd_search "$1"
        ;;
esac
