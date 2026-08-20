# 主线 1：论文阅读 → PPT 输出

**维护者**：worker2
**最后更新**：2026-06-02

## 默认 Skill 链

```
论文输入 (PDF/DOI/arXiv ID/Zotero key)
  │
  ├─→ [0] zotero-pdf-parse ─────── PDF→Markdown 预处理
  │     source: zotero-cli-cc (改编)
  │     trigger: /zotero-pdf-parse
  │     输入: Zotero item key / PDF path
  │     输出: content.md + 图片资产
  │     条件: 仅当 content.md 不存在时执行
  │
  ├─→ [1] ljg-paper ───────────── 初读 + 具体案例 + 笔记结构化
  │     source: /home/DataTransfer/Pyrojewel/code/02_claudeSkill/ljg-skills
  │     trigger: /ljg-paper
  │     输入: content.md / URL / 本地.md
  │     输出: paper notes (markdown) + 图片资产
  │     必经步骤
  │
  ├─→ [2] pyrojewel-paper-river ── 溯源脉络（引用链、方法演进）
  │     source: ljg-skills (改编)
  │     trigger: /pyrojewel-paper-river
  │     依赖: [1] 的笔记输出作为输入上下文
  │     输出: 溯源图谱 (markdown)
  │     条件: 溯源/闭环模式
  │
  ├─→ [3] ljg-qa ──────────────── 问答链与理解校验（可选）
  │     source: /home/DataTransfer/Pyrojewel/code/02_claudeSkill/ljg-skills
  │     trigger: /ljg-qa
  │     依赖: [1] 的笔记 + [2] 的溯源（可选）
  │     输出: QA 对齐报告 + ✅/⚠️/❌ 状态标记
  │     必经步骤
  │
  └─→ [4] beamer-academic ─────── 学术PPT生成与 PDF 编译
        source: 本地维护 fork
        trigger: /beamer-academic
        依赖: [1] 的笔记 + 图片 + [2] 的溯源 + [3] 的QA对
        输出: presentation.tex + presentation.pdf + assets
        条件: 用户确认需要PPT时
```

**默认接入顺序**：0(条件) → 1 → 2(条件) → 3 → 4(可选)，其中 2 和 3 可并行。
当前不再维护额外的论文 flow 编排器；按需依次调用上述 skill。

## Source Repo 归属

| Skill | Source Repo | 纳入主 flow | 说明 |
|-------|------------|------------|------|
| zotero-pdf-parse | zotero-cli-cc → skill_manager (改编) | **是** | 主链 [0]，已迁入 `skills/zotero-pdf-parse/`，输出对齐 Phase 1 |
| ljg-paper | `ljg-skills` | **是** | 主链 [1]，初读核心 |
| pyrojewel-paper-river | `ljg-skills` | **是** | 主链 [2]，溯源脉络 |
| ljg-qa | `ljg-skills` | **可选** | 主链 [3]，问答校验 |
| beamer-academic | 本地维护 fork | **是** | 主链 [4]，正式 PPT 输出与 PDF 编译 |
| guizang-ppt-skill | `guizang-ppt-skill` repo | **备选** | HTML PPT，非 Beamer 路线 |
| nature-paper2ppt | nature-skills | **仅参考** | 与 [4] 重叠，暂不纳入 |

## PPT 重叠处理（已统一）

- **`beamer-academic`** 是唯一论文阅读/组会/复现 PPT 与 Beamer PDF 编译入口
- `pyrojewel-beamer-academic`、`pyrojewel-paper-to-beamer` 和旧版 `pyrojewel-academic-ppt` 已删除
- `paper-compile` 只负责论文正文 LaTeX PDF，不参与 Beamer

## 当前 Blocker

1. **Zotero 库为空**：Zotero MCP 可连通但库中无条目，Phase 1（zotero-pdf-parse）无法通过 Zotero 路径验证。需先向 Zotero 导入论文。
2. **xelatex 未安装**：`which xelatex` 返回空，Phase 6（beamer-academic）无法编译。需安装 `texlive-xetex` 和 CJK 字体。
3. **端到端验证状态**：
   - Phase 0（入口分流）：✅ 逻辑已写入 SKILL.md
   - Phase 1（zotero-pdf-parse）：⚠️ skill 文件存在，但 Zotero 库无数据无法实测；env var 替换已完成
   - Phase 2（ljg-paper）：⚠️ 外部 skill 已接入，待用户触发 `/ljg-paper` 实测
   - Phase 3（pyrojewel-paper-river）：⚠️ skill 文件存在，依赖 Phase 2 产出
   - Phase 4（ljg-qa）：⚠️ 外部 skill 已接入，依赖 Phase 2 产出
   - Phase 5（汇总）：✅ 内置逻辑，无独立 skill
   - Phase 6（PPT）：❌ xelatex 未安装，无法编译
