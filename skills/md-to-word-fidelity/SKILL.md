---
name: md-to-word-fidelity
description: Use when converting authoritative Markdown into one or more existing DOCX templates and the deliverable must preserve template layout, fonts, headers/footers, numbering, citations, figures, and rendered appearance; especially when a fast regex or “Word opens” shortcut is being proposed.
---

# Markdown → Word 模板保真转换

## 核心原则

Markdown 是语义源，DOCX 模板是版式契约。转换对象不是“把文字塞进 Word”，而是把已核准的结构映射到既有模板，同时保留模板的页面、字体、段落、编号、页眉页脚、表格和媒体关系。**“Word 能打开”只证明 ZIP/OOXML 基本可读，不证明内容、版式或打印结果正确。**

## 适用边界

适用于：一份权威 Markdown 对应多个既有 DOCX 分册、章节长度不同、模板依赖直接格式、需要保留原样式并交付可打印文件的任务。

不适用于：只要无格式纯文本的 DOCX、允许完全重排的报告、或用户明确要求从零设计新模板。后两类可以使用独立排版工具，但仍须按任务要求验证输出。

## 端到端契约

输入必须明确三件事：

1. **权威正文**：唯一内容来源、编码、版本或 hash。
2. **模板集合**：精确文件名、数量、章节职责；排除 ~$ 锁文件和临时副本。
3. **输出目录**：新目录，不与输入目录重合；输出文件名与模板一一对应。

输出必须包含：

- 每个输出文件对应的“模板 → Markdown 起止章节 → 标题/元数据字段 → 图表/行政字段策略”映射记录；
- 原件 hash/mtime 记录；
- 自动检查结果；
- 渲染检查结果和未解决风险。

🔴 **STOP 1 · 输入边界**：源文件、模板数量、章节映射或输出目录存在实质歧义时，停止写入并列出候选项。不得凭文件排序、页码或相似文件名猜测。

## 实施流程

### 1. 先盘点模板，再解析正文

逐个读取模板并记录：

- section 数量、纸张尺寸、方向、页边距、页眉页脚关系；
- Heading 样式是否存在；若不存在，记录标题、二级标题、正文、参考文献的直接格式原型；
- pPr：对齐、缩进、行距、段前后距、分页控制、keep-with-next；
- rPr：西文字体、东亚字体、字号、粗斜体、字符间距；
- 编号定义/numPr、表格网格和样式、图片及其锚点；
- section break、字段、签章和行政占位。

页面位置不是章节边界。用显式 Markdown 标题和映射清单切分；不要用“原模板第几页到第几页”切分。

### 2. 先做块级解析，再做行内清理

解析器至少维护以下状态：普通段落、# 标题层级、围栏代码块、空行、无序/有序列表层级、引用/参考文献、表格、图片和链接。

- 围栏代码块内的 #、-、数字前缀不是标题或列表。
- [1]–[n] 是引用文本；除非任务明确要求改成 Word citation field，否则原样保留。
- 中文标点、Unicode 长破折号、器件名、网表名和代码样 token 先保留，再处理 Markdown 分隔符。
- 列表使用 Word 编号定义和嵌套层级；不要把 1. 当作普通正文拼进去。
- **强调**、反引号、链接标记只在块边界确定后清理；清理只能删除语法壳，不能删除其内容。

全局正则替换 DOCX XML 或整篇 Markdown 是红灯路径：它会误伤引用、代码、负号、列表重启、中文符号和字面量星号。

### 3. 建立固定映射并从模板副本生成

对每个文件建立如下记录：

输出文件 | 模板文件 | Markdown 起点 | Markdown 终点 | 标题策略 | 图片策略 | 引用/表格策略

以模板副本为起点，例如使用 copy2 后再加载副本。只清理正文内容；保留最后的 sectPr、页眉页脚关系、样式、编号定义、表格定义、图片关系和文档属性。不要用全新的 Document() 取代既有模板。

新段落从最接近的模板原型克隆 pPr 和 rPr，再写入文本。对中英文混排显式继承模板的西文字体和 East Asia 字体；不要只设置 run.font.name 就假定中文字体也正确。参考文献、正文、标题分别使用对应原型。

表格按单元格映射内容，保留表格网格、宽度、边框和分页属性。行政字段、签章、单位审核和日期没有权威值时保留原占位，不自行填值。

图像必须有显式策略：保留、替换、删除并以文字代替或暂停等待确认。当模板图片与权威正文冲突时，不得静默保留旧图。

🔴 **STOP 2 · 首次写入前**：确认映射清单、输出目录和图片策略后，才允许第一次保存输出。首次保存前记录源文件 hash/mtime。

### 4. 分层验收

**包和结构检查：**

- 输出数量和文件名恰好符合契约；
- unzip -t file.docx 通过，python-docx 能打开；
- section、页眉页脚、字体、字号、编号、表格和图片关系仍存在；
- 正文无围栏、反引号、标题标记、残余强调标记、错误的 Markdown 链接语法；
- 标题、列表顺序/嵌套、代码 token、Unicode 标点、引用集合与规范化源一致；
- 输出文本与源文本逐块比对，只允许映射表中声明的转换。

**视觉检查：**

用 LibreOffice 或等价渲染器生成 PDF/PNG。每个分册至少抽查首页、正文典型页、最深标题层级、列表/引用页、含中文与代码 token 的页、分页转折页和末页；先看联系表，再看异常页原图。

🔴 **STOP 3 · 发布前**：任何一个输出未通过包检查、文本检查或渲染检查，都标为“未验收草稿”，不得以“Word 能打开”作为交付结论。

## 失败分支与恢复

| 触发条件 | 一线处理 | 仍失败时 |
|---|---|---|
| 文件集合或章节职责不唯一 | 停止写入，输出候选清单 | 等用户确定唯一映射 |
| 输出覆盖输入或目标已存在 | 改用新、空输出目录 | 不删除旧输出，报告冲突 |
| DOCX ZIP 校验失败 | 从未修改的模板副本重新生成 | 保留坏文件作诊断，不交付 |
| 标题/列表/引用缺失 | 回到块解析和映射边界修复 | 停止该分册，报告缺段位置 |
| 中文字体或段落格式漂移 | 重新克隆模板原型的 pPr/rPr，检查 East Asia 字体 | 标记版式未验收，不手工逐字补丁 |
| PDF 看起来缺标题 | 用 pdftotext、PNG 和 OOXML 三方核对 | 核对前不宣称内容丢失 |
| 模板旧图与正文冲突 | 执行已记录的保留/替换/删除策略 | 策略未确定则暂停交付 |
| 底部空白很大 | 检查 page break、分页控制、锚定对象和章节长度 | 若是模板固有空白则记录，不为填满页面硬改 |
| 渲染器不可用 | 保留结构检查结果 | 明确标注“未完成视觉验收”，等待确认 |

## 一个可复用的段落克隆核心

下面的核心只展示“继承模板原型”的方式；章节解析和映射仍需在外层完成。

~~~~python
from copy import deepcopy
from docx.shared import Pt
from docx.oxml.ns import qn

def first_text_run(paragraph):
    return next((run for run in paragraph.runs if run.text), None)

def clone_role_format(source, target, east_asia="宋体",
                      western="Times New Roman", size=10.5):
    if source._p.pPr is not None:
        target_ppr = target._p.get_or_add_pPr()
        for child in list(target_ppr):
            target_ppr.remove(child)
        for child in source._p.pPr:
            target_ppr.append(deepcopy(child))
    src_run = first_text_run(source)
    run = target.add_run()
    if src_run is not None and src_run._r.rPr is not None:
        target_rpr = run._r.get_or_add_rPr()
        for child in list(target_rpr):
            target_rpr.remove(child)
        for child in src_run._r.rPr:
            target_rpr.append(deepcopy(child))
    run.font.name = western
    run._element.rPr.rFonts.set(qn("w:eastAsia"), east_asia)
    run.font.size = Pt(size)
    return run
~~~~

实际写入时先把 run.text 设为规范化文本，再运行统一的段落/字体审计。清空正文 XML 时保留 sectPr，否则页面、页眉页脚或分节会被破坏。

## 红灯清单：不要做什么

- 不覆盖原始 DOCX、权威 Markdown 或用户未授权的其他材料。
- 不对整篇 Markdown、DOCX XML 或所有 runs 做一次性正则替换。
- 不用新建空白文档重做模板保真转换。
- 不按页码猜章节，不把所有分册重复写成全文。
- 不把 [n] 引用、负号、长破折号、代码 token 当作 Markdown 噪声删除。
- 不删除正文时顺手删除 sectPr、编号定义、页眉页脚关系或图片关系。
- 不因“文件能打开”“PDF 查看器缩略图没显示”就跳过文本和图像核对。
- 不静默保留与权威正文冲突的旧图，也不为了填充空白而擅自改分页。
- 不在渲染失败后把结构检查写成“版式验收通过”。

## 交付报告最小格式

输出目录：...

源文件 → 输出文件：逐项列出

映射：每个输出的 Markdown 起止章节

继承：页面/分节/页眉页脚/字体/段落/编号/表格/媒体

检查：数量、hash/mtime、ZIP、可打开性、文本、引用、渲染

风险：旧图、未渲染分册、字体替换、分页异常或待用户决定项

仅当所有发布门槛通过，才把状态写成“已验收”；否则写成“未验收草稿”并指出阻塞项。
