# beamer-academic — 本地说明

**状态:** `active`(维护中的本地 fork,不是原样镜像)
**Base:** `Faust-Donf/beamer-academic` @ `788e125` (v1.5, 2026-08-17)
**当前版本:** `1.6+pyrojewel.2`
**迁入 / 转维护:** 2026-08-17

## 定位与路由

`zuhui-beammer` 已于 2026-08-17 删除(ADC 组会线并入本 skill 的通用能力,专属能力不再维护)。当前保留两条 beamer 线:

| Skill | 用途 | 主要触发词 |
|---|---|---|
| `beamer-academic`(本 skill) | 开题、会议、conference talk、通用学术汇报 | `beamer-academic`、`开题PPT`、`会议报告`、`conference PPT` |
| `beamer-academic` | 论文阅读、组会/会议汇报、复现和 Beamer PDF 编译 | `beamer-academic`、`论文精读PPT` |

### ⚠ 未解决的路由歧义

历史上曾存在另一套 `pyrojewel-beamer-academic` 通用 trigger，已从项目和运行时 skill 目录移除；当前统一使用 `beamer-academic`。

判断规则(暂时靠 description 兜):**要证据契约和 Obsidian 输出走 pyrojewel,其余走本 skill。**

## 本地 patch 日志

正文(SKILL.md frontmatter 之后已加入本地 reproduction profile)。**主题与布局已分叉。**

### [P1] 2026-08-17 — 修封面三处失效守卫

`assets/beamerthemeAcademic.sty`,上游 147/158/161 行:

```latex
\ifx\themelogo\empty\else  ... \fi
\ifx\supervisor\empty\else ... \fi
\ifx\major\empty\else      ... \fi
```

三者均由 `\newcommand` 声明。`\newcommand` 生成 **`\long` 宏**,`\empty` 不是 `\long`,而 `\ifx` 比较含前缀的完整 meaning ⇒ 三个判断**永远为假**,跳过分支永远走不到。

上游实测后果(默认封面,未设 logo/supervisor/major):

1. 空文件名进 `\includegraphics` ⇒ `! LaTeX Error: File `' not found.`,在 `-halt-on-error` 下**中断编译**
2. 空的「指导教师」「专业」标签行照常打印

改为 etoolbox 的 `\ifdefempty`(该包主题已 `\RequirePackage`):

```latex
\ifdefempty{\themelogo}{}{%  ... }%
\ifdefempty{\supervisor}{}{% ... }%
\ifdefempty{\major}{}{%      ... }%
```

双向验证通过:未设时 0 错误且标签行消失;`\setsupervisor{Prof X}\setmajor{EE}` 时正常打印。

同一份主题在别处(`\insertframesubtitle` 守卫、`\thanksframe`)已经正确使用 `\ifstrempty`,所以这三处是上游内部不一致。**值得提 upstream PR**——提了之后本 patch 可以撤掉。

### [P2] 2026-08-18 — 论文算法复现汇报模式

`SKILL.md` 新增 `report_type: reproduction`：每篇论文 2--5 页，固定覆盖
overview、algorithm-derivation、paper-code-map、reproduction-result；布局参考和
`references/reproduction-contract.md` 固定论文原图、示意重绘、当前复现图及
`file:function` 的证据边界。

`assets/beamerthemeAcademic.sty` 与 `examples/transformer/beamerthemeAcademic.sty`
同步改为白底紧凑 `\sectiondivider`，删除默认满版纯色章节转换效果，并增加
`listings`、`\codeentry`、`\statuslabel`、`\paperstep`。两个主题副本必须保持一致。

`examples/transformer/beamerthemeAcademic.sty` 是 `assets/` 的副本,已同步。改主题时记得两份一起改。

### [P3] 2026-08-19 — 单篇论文阅读汇报模式

`SKILL.md` 新增 `paper-reading` profile，输入可来自用户已有的 `ljg-paper`
笔记及其 `ljg-read` / `ljg-qa` 追加内容；只有论文时先走 `ljg-paper`。单篇论文
内容页上限为4页，默认顺序是概览、理论/推导—论文图、证据—结果图、QA/困惑点。

新增 `references/paper-reading-contract.md`，规定先生成并展示 `outline.md`，用户
确认后才允许生成 LaTeX。新增四个阅读汇报版式，统一将会议/年份、主题、作者或
课题组放入 subtitle 层，正文默认左理论/解读、右一张可读论文图。

### [P4] 2026-08-19 — implementation-report 分工

计划读取、代码/运行结果分析、数据审计、公式、Python 图表和结构化 diagram brief
已拆到同项目的 `skills/implementation-report/`，流程图由
`skills/diagram-design/` 直接绘制。本 skill 只消费 manifest 指定的
bundle/PNG；当涉及代码/复现时，先使用 `workflow-overview`，再进入
`paper-code-map` 或结果页，避免代码单独占页。

## upstream 同步流程

上游仓库在 `02_claudeSkill/beamer-academic/`(remote `Faust-Donf/beamer-academic`)。

**⚠ 不要 `cp` 工作区。** 该工作区受挂载盘 unlink 权限限制,`git pull` 会失败,历史上用 `git update-ref` 绕过,导致 **HEAD 指向新版但工作区文件停在旧版**。2026-08-17 首次迁入时工作区是 v1.0 而 HEAD 已是 v1.5。

正确做法是从 commit 对象提取:

```bash
cd /path/to/02_claudeSkill/beamer-academic
git fetch origin && NEW=$(git rev-parse origin/main)
git archive "$NEW" | tar -x -C /tmp/ba_new
```

然后:

1. `diff` 正文确认上游改了什么(本地正文未分叉,应该是干净 diff)
2. 覆盖 `assets/` `references/` `scripts/` `docs/` `examples/`
3. **重新施加上面的 patch 日志**(逐条检查是否已被上游修掉;修掉的就删掉对应条目)
4. 保留本地 frontmatter(name/version/description/trigger/local_notes)
5. 丢弃上游的仓库治理文件:`.github/`、`README.md`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`.gitignore`
6. 跑下面的验证
7. 更新本文件的 patch 日志和 `references/skill-source-map.md`

本次保留的上游文件:`SKILL.md`、`assets/`、`references/`、`scripts/`、`docs/`、`examples/`、`LICENSE`、`CHANGELOG.md`。

## 验证

```bash
# 主题冒烟测试(不需要中文环境)
cd /tmp && cp {skill}/assets/beamerthemeAcademic.sty .
cat > t.tex <<'EOF'
\documentclass[aspectratio=169,10pt]{beamer}
\usepackage{beamerthemeAcademic}
\title{T}\author{A}\institute{I}\date{D}
\begin{document}\begin{frame}[plain]\titlepage\end{frame}\end{document}
EOF
xelatex -interaction=nonstopmode t.tex
grep -c "File \`' not found" t.log   # 必须是 0
pdfinfo t.pdf | grep "Page size"     # 必须 453.54 x 255.12 pts = 16:9
```

组件存在性检查:

```bash
for c in statementframe statrow hyporow headrow setcoverlabels setlogo; do
  grep -c "newcommand{\\\\$c}" assets/beamerthemeAcademic.sty
done
grep -n "beamer@centeredfalse\|hrule height" assets/beamerthemeAcademic.sty
```

## 环境依赖

VM 内 `xelatex` 可用,但 **`texlive-lang-chinese` 缺失**(`ctexhook.sty` 找不到),所以 `examples/transformer/defense.tex` 在本 VM 编译不过——它依赖 `xeCJK` + `Heiti SC`/`STFangsong`。主题本身 Latin-only 测试通过(6 页,453.54×255.12 pt = 16:9)。

出中文片先装:

```bash
sudo apt install texlive-xetex texlive-lang-chinese texlive-fonts-recommended
```

字体名换成本机可用值(如 `AR PL UMing CN`)。

## 已删除的 zuhui-beammer(如需取回)

2026-08-17 删除。上游 v1.5 完全没有、随 zuhui 一起放弃的四项能力:

- `page_manifest.tsv` 证据契约(`source_id/location`、`interpretation`、`boundary`、`evidence_status` 四态含 `unknown`)
- 语义化配色(red=raw/error、green=corrected、blue=ideal,强制配图例)
- `zuhuicode` 代码块(Verilog-A/MATLAB/Python)
- `pdftoppm` 栅格化视觉 QA + 数值硬门(正文 ≥8pt、表格 ≥7.6pt、图注 ≥7pt)

取回方式:

```bash
git show 0e128a2:skills/zuhui-beammer/SKILL.md
git checkout 0e128a2 -- skills/zuhui-beammer   # 整目录恢复
```

其中前两项若日后要补,可直接在 `beamer-academic` 的证据契约中扩展。
