# beamer-academic — 本地说明

**来源:** `Faust-Donf/beamer-academic` @ `788e125` (v1.5, 2026-08-17)
**同步日期:** 2026-08-17
**定位:** 上游原样保留，用于与 `pyrojewel-beamer-academic` 对比。**不是**主用 skill。

## 与其他两个 beamer skill 的关系

| Skill | 用途 | 触发 |
|---|---|---|
| `pyrojewel-beamer-academic` | 答辩/学术汇报主线（本地 v4.6，带证据契约、Obsidian 输出） | `答辩PPT`、`beamer`、`学术报告` 等通用词 |
| `zuhui-beammer` | ADC/电路组会（白底红线，语义化配色） | `zuhui-beammer`、`ADC标定PPT` 等 |
| `beamer-academic`（本 skill） | 上游对照版 | 仅显式指名：`beamer-academic`、`上游 beamer` |

本 skill **故意不占用**通用触发词，避免和 `pyrojewel-beamer-academic` 抢路由。

## 文件状态

`SKILL.md` 正文（frontmatter 之后 494 行）与上游 `788e125` **逐字节一致**，只有 frontmatter 是本地的。后续 upstream 更新可以直接 diff 正文。

`assets/`、`references/`、`scripts/`、`docs/`、`examples/` 均为上游原样。已丢弃上游的仓库治理文件（`.github/`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`README.md`、`.gitignore`），保留 `LICENSE` 和 `CHANGELOG.md` 用于溯源。

本次同步是从 git 对象（`git show 788e125:`）提取的，**不是**从 `02_claudeSkill/beamer-academic/` 工作区拷贝的——该工作区因挂载盘 unlink 权限限制停留在 v1.0，HEAD 却已指向 v1.5，直接 `cp` 会拿到旧版。

## ⚠ 已知上游 bug（v1.5，未修）

### 封面三个 `\ifx...\empty` 守卫全部失效

`assets/beamerthemeAcademic.sty` 第 147/158/161 行：

```latex
\ifx\themelogo\empty\else  ... \fi   % line 147
\ifx\supervisor\empty\else ... \fi   % line 158
\ifx\major\empty\else      ... \fi   % line 161
```

三者都用 `\newcommand` 声明（129/131/141 行）。`\newcommand` 生成的是 **`\long` 宏**，而 `\empty` 不是 `\long`。`\ifx` 比较含前缀的完整 meaning，所以这三个判断**永远为假**，跳过分支永远走不到。

**实测后果**（默认封面，未设 logo/supervisor/major）：

1. `\includegraphics{}` 收到空文件名 → `! LaTeX Error: File `' not found.`
   在 `-halt-on-error` 下直接中断编译（SKILL.md Phase 4 的部分编译命令带这个 flag）
2. 「指导教师」「专业」两行标签照常打印，值是空的

复现：任意 `.tex` 只 `\usepackage{beamerthemeAcademic}` + `\titlepage`，不设 logo。

### 修复（已验证可用，本地未施加）

`etoolbox` 已经被主题 `\RequirePackage`，直接用 `\ifdefempty`：

```latex
\ifdefempty{\themelogo}{}{%  ... }    % 对应 \fi 改成 }
\ifdefempty{\supervisor}{}{% ... }
\ifdefempty{\major}{}{%      ... }
```

验证结果：空文件名错误从 1 降到 0，多余标签行消失，封面正常输出。

主题本身在别处（`\insertframesubtitle` 守卫、`\thanksframe`）已经正确使用了 `\ifstrempty`，所以这三处属于内部不一致，适合作为 upstream PR 提交。

**本地暂不修改**，以保持与上游的干净 diff。若要实际使用本 skill 出片，先施加上述修复，或始终通过 `\setlogo{}`/`\setsupervisor{}`/`\setmajor{}` 显式赋非空值绕开。

## 环境依赖

VM 内 `xelatex` 可用，但 **`texlive-lang-chinese` 缺失**（`ctexhook.sty` 找不到），因此 `examples/transformer/defense.tex` 在本 VM 编译不过——该样例依赖 `xeCJK` + `Heiti SC`/`STFangsong` 字体。主题本身（Latin-only 冒烟测试）编译通过：6 页，453.54×255.12 pt = 16:9。

出中文片需先装：

```bash
sudo apt install texlive-xetex texlive-lang-chinese texlive-fonts-recommended
```

字体名按本机可用值替换（如 `AR PL UMing CN`，参考 `zuhui-beammer` 的 TeX 头部）。

## 值得吸收到另两个 skill 的点

评估记录见 2026-08-17 会话。简要：

- **主题层可直接抄**：`\beamer@centeredfalse`（顶对齐，修 Beamer 默认 `c` 把余高塞进标题与正文之间）、标题线用 `\hrule height 1.15pt` 而非 `\rule`（后者会当段落多吐一行空白）
- **组件**：`\statrow`（三个大数字，适合 ENOB/DNL/步数）、`\keybox` 左竖条版
- **纪律**：`references/writing-style.md` 的标题红旗和措辞红旗清单值得吸收；但 `itemize` 全面禁令是为 35–50 页答辩校准的，**不建议**照搬到 7–12 页的 `zuhui-beammer`
- **反向**：`zuhui-beammer` 的 `page_manifest.tsv` 证据契约（source/location、interpretation、boundary、evidence_status）上游完全没有，答辩场合价值更高，应反向补进 `pyrojewel-beamer-academic`
