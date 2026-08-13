---
name: evidence-to-lecture-handout
description: Use when Codex must turn timestamped lecture transcripts and slide images into a Chinese, image-rich technical handout with page-aligned lecture scripts, complete Q&A extraction, and a vertical XeLaTeX PDF.
---

# Evidence to Lecture Handout

将视频证据整理成“原课件图 + 课件要点 + 中文讲演录 + 英文讲演录 + 完整问答”的双语技术讲义，并编译为图片与文字对应的 A4 竖版 XeLaTeX PDF。最终交付物是可连续阅读、可直接朗读的讲演录，不是 Raw transcript evidence 的拼接。Codex 本身负责最终阅读、理解、翻译和撰写；脚本只负责抽取、索引、缓存证据和排版。

**最终讲演录禁止把外部 LLM 输出当成原始讲稿：** `.env` 中的 `OPENAI_MODEL`、vision LLM、翻译 API 只能用于独立实验或候选分析，不能未经 Codex 核验直接写入最终讲演录、问答或技术结论。最终稿必须由 Codex 基于原始图片、OCR 和 Whisper 时间戳理解、改写和翻译。

**REQUIRED SUB-SKILL:** Use `pyrojewel-beamer-academic` only for academic typography, asset handling, and compile validation. The final document is A4 portrait `ctexart`, not Beamer.

## 输入契约

优先读取以下文件；缺失项必须在报告中列出：

- `transcript.jsonl`: `{start,end,text}`，原始录音优先。
- `slides.json`: 页面图、时间戳、页码、OCR、content fingerprint、mask 状态。
- `page-segments.json`: 页面出现区间和回看关系。
- `notes-draft.md` / vision JSON：只作初步解释，不作无来源事实。
- 原始页面图片/PDF：作为视觉证据。

每条事实保留来源：`[transcript mm:ss]`、`[slide N]` 或 `[OCR]`。图片引用使用可解析的相对路径。

原始 ASR 是内部证据，不是讲义正文。可以读取并保留
`transcript-full.md`、`transcript.jsonl` 和 `handoff.json`，但最终讲义和
`lecture-script.en.md`/`lecture-script.zh.md` 不得逐段复制 ASR。每个页面
必须把对应时间窗中的语句整理成连贯的讲演录；口头填充、重复、识别噪声和
明显断句错误应修复，但不得删除实质内容。

### 图片输出契约：PIP 只分析，不裁剪成最终讲义图

- 最终讲义必须使用完整的代表帧/完整 PPT 画面，保留所有边缘区域和视频中的摄像头区域。
- PIP、人脸或摄像头 mask 只允许用于相似度计算、OCR ROI、页码识别、遮挡标记和去重判断。
- `pipCrop`、`review/pip/`、`claude-handoff/images/` 等裁剪图不得作为最终讲义或最终 PDF 的图片资产。
- 最终图片应来自未裁剪的高分辨率代表帧，例如 `slide_NNNN_<timestamp>.00s.png`，并在证据 JSON 中记录 `mask.analysisOnly=true`、`mask.applied=false`。
- 编译前必须检查：最终引用图片的尺寸/比例与完整代表帧一致；若发现图片尺寸明显变小或边缘缺失，停止编译并替换资产。

### 图片与录音联合分析

图片不是装饰，必须和页面时间窗一起分析。对每个页面建立：

```text
page image + mask/crop metadata
  + page interval [start,end]
  + transcript segments intersecting that interval
  + OCR/vision observations
→ page claims and timestamped explanation
```

### 双语讲演录

每页必须按以下顺序呈现：

1. `中文讲演录`：Codex 根据同一时间窗的英文讲演录、PPT 图片和 OCR 写成可直接朗读的中文讲演。必须完整表达英文中的事实、限定词、因果关系、转折、例子和论证顺序，不能只翻译标题或压缩成摘要。
2. `English lecture script`：Codex 根据同一时间窗的 Whisper 原文修复成完整、自然的英文讲演录，删除口头填充、重复和明显识别噪声，但不得新增原文没有的事实、公式或结论。不得使用 `…` 截断，也不得把原始 ASR 片段直接当成最终稿。
3. 页首只保留一行 `时间窗：[... ]；来源：\`[slide:N]\``。不再生成独立的“时间窗与来源”“录音时间窗”“PPT 页码”“绑定 Whisper 片段”“OCR 行数”元数据块。

英文讲演录不是摘要，也不是逐字稿；它应保留该时间窗的完整实质内容，并能回溯到原始 Whisper 片段。中文讲演录是英文讲演录的完整中文表达，不能只保留要点。中文和英文都必须引用同一个页面图片和时间窗。

只把与页面区间相交的 transcript segments 放入该页；页面内发生内容变化时拆成子窗口，例如 `[10:20–11:10]` 与 `[11:10–11:40]`。每个子窗口都要同时引用页面图片和对应录音，不得先独立总结录音、再把图片作为事后插图。

## 最小页面数据单元

每页先生成结构化记录，再渲染 Markdown/PDF：

```json
{
  "slide": 12,
  "version": "12-a",
  "time": {"start": 125.4, "end": 181.8},
  "image": "images/slide-012-a.png",
  "pageNumber": 12,
  "revisit": {"kind": "first|same|variant", "timestamps": []},
  "mask": {"applied": true, "regions": []},
  "sources": {"transcript": [], "ocr": [], "vision": []},
  "claims": [],
  "derivations": [],
  "uncertainties": []
}
```

渲染失败时保留该记录并将状态设为 `incomplete`，不得静默删除页面。

## 交付结构

按以下顺序输出 Markdown 或 PDF 草稿：

1. 封面：标题、来源、处理范围、证据状态。
2. 目录：按页面标题或讲座章节生成。
3. 每页一个单元：
   - 原课件图
   - `课件要点`：只列图片/OCR可确认内容
   - `中文讲演录`：按时间窗改写为连贯、可朗读中文，不是条目式摘要
   - `English lecture script`：同一时间窗的完整英文讲演录，不是 Raw transcript evidence
   - 页首时间窗与 `[slide:N]`：只提供最小导航信息
   - `公式与推导`：仅在证据足够时出现
4. 末尾附录：术语表、公式索引、证据缺口和处理日志。

每个页面单元必须包含：`[mm:ss–mm:ss]`、`[slide:N]`、图片路径和可回溯的 transcript 来源。页面回看不能静默重复：标注“首次出现/回看/内容变体”。页面正文只能呈现整理后的中英文讲演录；逐段原文只能通过来源文件回溯。

### 中文翻译硬门槛

- `scriptZh` 必须是中文讲演文本，不得包含“与该页时间窗严格对齐的讲者说明包括”“完整代表帧中的关键信息为”等证据模板。
- 不得把 `englishProcessed`、Whisper 原文、OCR 行或英文摘要复制到 `scriptZh`。英文术语、缩写、专有名词和公式可以保留，但中文句法必须承担主要叙述。
- 中文稿与英文稿必须逐页同范围、同顺序、同事实密度。中文稿少于英文稿的核心事实时，标记 `translation-incomplete`，不得编译最终 PDF。
- 对英文稿超过 300 字符的技术页，中文稿长度原则上不得低于英文稿的 18% 且不得少于 80 字符；低于该密度通常意味着只写了摘要，必须回到英文讲演录补齐事实、例子、数字和限定条件。主持/致谢/结束页可由 Codex 标注为短页并人工复核。
- 页面只有主持、致谢或结束语时可以短，但仍须是自然中文句子，不能用英文原文代替。
- `author_workshop_handout_from_evidence.py` 只能生成证据草稿，不能直接生成最终 `authored-notes.json`；最终 `scriptZh` 和 `englishProcessed` 必须由 Codex 重新阅读后写入。

### 交接文件

同时生成 `handoff.md` 和 `handoff.json`。JSON 保存上述页面记录和完整
transcript segment 的 exact-once 映射；Markdown 按以下顺序列出：输入文件、
处理参数、页面目录、事实清单、推导清单、冲突、待核查问题。原始逐段英文
只放在 `transcript-full.md` 或 `handoff.json` 的 sources 字段中，供审计和
回溯，不作为 handout.md、PDF 或双语讲演录的正文。下游编辑代理消费交接
文件和原始图片来核查，不应把 evidence 字段原样复制到最终讲义。

编译目录固定包含：

```text
handout.md
handout/
├── handout.tex
├── handout.pdf
├── beamerthemeAcademic.sty
├── materials/figures/      # 页面图片，必须实际存在
└── handout.log
```

## 公式推导协议

先分层，再推导：

| 标签 | 含义 |
|---|---|
| `FACT-TRANSCRIPT` | 录音明确说出的事实 |
| `FACT-SLIDE` | 图片、OCR或公式明确可读的事实 |
| `DERIVED` | 由已知公式和假设逐步推出的结果 |
| `ASSUMPTION` | 为完成推导而显式加入的假设 |
| `TO-VERIFY` | 参数、符号或版式不够清晰，不能确认 |

推导固定使用：

1. 抄录符号、单位、已知量和目标量；不替图片猜符号。
2. 写出原始方程及其来源。
3. 逐步变形，每一步说明使用的定律、近似或边界条件。
4. 做量纲检查、极限情况检查，并在有数据时做数值回代。
5. 将最终式、适用条件和不确定项分开；缺参数时输出未完成推导，不填默认数值。

示例：

```text
[FACT-SLIDE] 已知小信号关系：Av = -gm·Rout。
[ASSUMPTION] 低频小信号模型，忽略 ro 与负载变化。
[DERIVED] 若 gm 增加而 Rout 不变，则 |Av| 按比例增加：
  |Av'|/|Av| = (gm'·Rout)/(gm·Rout) = gm'/gm。
[TO-VERIFY] 页面未给出 gm、Rout 的数值，不能给出数值增益。
```

## 页面回看与冲突处理

- 页面身份使用 `pageNumber + contentFingerprint`；页码相同但正文、公式或图结构变化时拆成不同版本。
- 同一身份回看：合并到同一讲义页，保留首次出现和回看时间，并只补充新增讲解。
- transcript 与 slide 冲突：分别呈现，标 `CONFLICT`，不得替用户裁决；在待核查表中列出。
- OCR、图片和 LLM 描述冲突：原图优先，OCR 次之，LLM 描述只能作辅助解释。

## 失败分支

| 触发条件 | 输出动作 |
|---|---|
| transcript 缺失 | 只生成课件事实，页面标 `TO-VERIFY: no transcript` |
| 图片不可读 | 保留页码和 OCR；标记 `image-unreadable`，不生成视觉细节 |
| 公式符号不清 | 输出可读片段和缺失符号，不猜完整公式 |
| 参数不足 | 给出符号推导或明确 `derivation-incomplete`，不造数值 |
| 回看页内容冲突 | 拆分 content fingerprint，保留两个版本并列出差异 |
| LLM 返回非 JSON/无来源结论 | 丢弃该结论，保留本地证据并记录失败 |

## 禁止事项

- 不把初步 LLM 解释写成讲者原话。
- 不把图片相似度当作公式或事实证据。
- 不因页码相同直接合并不同内容。
- 不为补齐讲稿、公式或数值而引入未声明的知识和参数。
- 不隐藏缺页、OCR 失败、回看、冲突或推导假设。
- 不输出只有图片索引、没有 transcript 和时间戳的“笔记”。
- 不只输出中文而丢失英文讲演录；中文和英文讲演录必须成对出现。
- 不把 Raw transcript evidence 放入 handout.md、handout.tex、PDF 或逐页讲演录正文；原始逐段 ASR 只能保存在 `transcript-full.md`、`transcript.jsonl` 和 `handoff.json` 中供回溯。
- 不把英文讲演录写成摘要、要点列表或逐字稿；它必须是覆盖完整实质内容的可朗读讲演文本。
- 不把 PIP crop、摄像头 mask crop 或审核 contact sheet 当作最终讲义图片；最终稿必须引用完整代表帧。
- 不在图片与录音时间窗完成对齐前编译最终 PDF。
- 不把整段视频 transcript 复制到每一页；页面只接收与其时间区间相交的片段。

## 质量检查

交付前逐页检查：

- 图片、页码、时间窗和 transcript 是否一一可追溯。
- 每页图片是否与该页录音时间窗共同出现，而不是只作为独立附件。
- 页面内多个时间子窗口是否分别绑定了对应录音段和同一页图片。
- 每个公式是否有来源、假设、步骤和量纲/极限检查。
- `DERIVED` 是否没有伪装成 `FACT-*`。
- 回看页、同页码变体和冲突是否保留。
- 目录页数、页面索引和 PDF 页数是否一致。
- 报告是否明确区分录音事实、PPT事实、初步解释和最终待推导内容。
- `scriptZh` 是否主要由中文句法构成，并且不包含英文讲演稿的长段复制。
- 中文讲演稿是否逐页覆盖英文讲演稿的同一事实、限定词、因果关系和例子；不能以“看起来像中文”替代语义核对。
- 中文/英文长度和事实密度是否合理；长英文技术页对应的中文不能只有一句概括性总结。
- `handout.md`、`handout.tex` 和 PDF 正文是否不存在 `Raw transcript evidence` 标题、逐段 ASR 或独立来源元数据块；原始证据是否仍在 sidecar 文件中可定位。

本 skill 目录同时提供 `scripts/validate_lecture_translation.py` 和
`scripts/audit_workshop_translation.py`；安装 skill 后优先使用这两个配套脚本，
不要依赖项目中可能过期的同名脚本。

### 全量验收命令

在处理多个 Workshop Talk 时，必须先对所有最终目录运行：

```bash
python3 scripts/audit_workshop_translation.py \
  --root output/workshop-talks \
  --json output/workshop-talks/translation-audit.json \
  --markdown output/workshop-talks/translation-audit.md
```

该命令对每个 Talk 同时检查 `authored-notes.json`、`authored-qna.json`、
`handout.md`、`handout.tex`、`lecture-script.zh.md` 和
`lecture-script.en.md`。任何一个 Talk 为 `FAIL` 时，所有旧 PDF 都只能标记
为草稿，不能继续批量编译或汇报为完成。

自动检查通过后仍须逐页做语义抽查：至少检查开场、技术定义、公式/数字、结果、回看页、问答和结束语。抽查时对照图片、英文讲演录和时间窗，确认中文不是泛化模板、不是英文词典替换，也没有漏掉限定条件、因果关系或例子。

## 🔴 CHECKPOINT：提交前停止

在写出最终 Markdown/PDF 前停止并完成以下检查；任一项失败，交付状态必须为 `incomplete`：

1. 页面记录数量、图片索引、目录和 PDF 页数一致。
2. 每个 `FACT-*` 有至少一个来源；每个 `DERIVED` 有输入事实和假设。
3. 每个公式通过单位检查或明确标记 `unit-check: unavailable`。
4. 所有回看、内容变体、冲突、OCR 失败和图片缺失都出现在 `uncertainties`。
5. `handoff.md/json` 可独立定位每条笔记到页面和时间戳。

检查通过后才渲染最终稿；检查失败时只输出草稿和失败清单，不用“看起来合理”替代证据。

## Markdown → XeLaTeX 编译流程

这是强制两阶段流程，不允许跳过 Markdown 确认直接写 `.tex`：

1. 生成完整 Markdown：每个 `##` 对应一个讲义页面，包含图片、时间窗、中文讲演录、英文讲演录和来源；不要把原始英文片段复制进正文。
2. 🔴 CHECKPOINT：检查页面数、图片路径、时间戳、中文/英文对照、事实标签和图片是否为完整代表帧；失败则停在 Markdown 草稿。
   同时必须运行 `audit_workshop_translation.py`；中文语义未通过时不得进入 LaTeX。
3. 创建独立 A4 编译目录，复制全部图片到 `materials/figures/`；使用 `ctexart`、页眉页脚、中文章节标题和参考讲义式竖版布局。
4. 每页按“章节标题 → 页首时间窗/来源 → PPT 图片 → 幻灯片要点 → 中文讲演录 → English lecture script”排版；图片高度必须受约束，长文本允许分页。
5. 公式只在证据明确时插入，不为填充版面固定增加公式章节。问答作为独立附录，保留中英文对照和原始时间戳。
6. 运行 `xelatex` 两次；检查 `.log` 中 `Error`、`Undefined control sequence`、`File not found`、`Font not found`、`Overfull \vbox` 和严重 `Overfull \hbox`。
7. 检查 PDF 页数等于页面记录数，逐页确认图片存在且不是空白，来源链接仍可解析。

编译失败时：先修复日志中最早的错误；图片缺失修复资产路径，字体缺失切换已安装 CJK 字体，溢出通过降低图片高度或拆分正文修复。修复后重新编译并保留日志，不以“PDF 已生成”代替通过检查。
