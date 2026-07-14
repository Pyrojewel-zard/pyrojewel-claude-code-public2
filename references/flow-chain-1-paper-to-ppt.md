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
  ├─→ [1] pyrojewel-paper ──────── 精读 + 图片管理 + 笔记结构化
  │     source: ljg-skills (改编)
  │     trigger: /pyrojewel-paper
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
  ├─→ [3] pyrojewel-paper-qa ───── 阅读对齐拷打（自检理解深度）
  │     source: ljg-qa (改编)
  │     trigger: /pyrojewel-paper-qa
  │     依赖: [1] 的笔记 + [2] 的溯源（可选）
  │     输出: QA 对齐报告 + ✅/⚠️/❌ 状态标记
  │     必经步骤
  │
  └─→ [4] pyrojewel-beamer-academic ── 学术PPT生成
        source: pyrojewel-beamer-academic repo (正式替代原 beamer-academic)
        trigger: /pyrojewel-beamer-academic
        依赖: [1] 的笔记 + 图片 + [2] 的溯源 + [3] 的QA对
        输出: presentation.tex + presentation.pdf + assets
        条件: 用户确认需要PPT时
```

**默认接入顺序**：0(条件) → 1 → 2(条件) → 3 → 4(可选)，其中 2 和 3 可并行。
**编排器**：`/pyrojewel-paper-flow` 串联以上所有阶段，含入口分流逻辑。

## Source Repo 归属

| Skill | Source Repo | 纳入主 flow | 说明 |
|-------|------------|------------|------|
| zotero-pdf-parse | zotero-cli-cc → skill_manager (改编) | **是** | 主链 [0]，已迁入 `skills/zotero-pdf-parse/`，输出对齐 Phase 1 |
| pyrojewel-paper | ljg-skills (改编) | **是** | 主链 [1]，精读核心 |
| pyrojewel-paper-river | ljg-skills (改编) | **是** | 主链 [2]，溯源脉络 |
| pyrojewel-paper-qa | ljg-qa (改编) | **是** | 主链 [3]，深度校验 |
| pyrojewel-beamer-academic | `pyrojewel-beamer-academic` repo | **是** | 主链 [4]，正式 PPT 输出 |
| pyrojewel-paper-flow | self-built (编排器) | **是** | 串联 [0]-[4]，含入口分流 |
| beamer-academic (原) | `beamer-academic` repo | **仅参考** | 已被 pyrojewel-beamer-academic 替代 |
| pyrojewel-academic-ppt | `.claude/skills/` | **已废弃** | 已标记 superseded，不再调用 |
| guizang-ppt-skill | `guizang-ppt-skill` repo | **备选** | HTML PPT，非 Beamer 路线 |
| nature-paper2ppt | nature-skills | **仅参考** | 与 [4] 重叠，暂不纳入 |

## PPT 重叠处理（已解决）

- **`pyrojewel-beamer-academic`**（`skills/pyrojewel-beamer-academic/`）为正式 PPT skill
- **`pyrojewel-academic-ppt`**（`.claude/skills/pyrojewel-academic-ppt/`）已标记 `superseded_by: pyrojewel-beamer-academic`，不再接收更新，保留仅供参考
- **`beamer-academic`**（上游 repo）仅作为模板/参考来源，不直接调用
- 所有 flow 文档和编排器中统一引用 `/pyrojewel-beamer-academic`

## 当前 Blocker

1. **Zotero 库为空**：Zotero MCP 可连通但库中无条目，Phase 1（zotero-pdf-parse）无法通过 Zotero 路径验证。需先向 Zotero 导入论文。
2. **xelatex 未安装**：`which xelatex` 返回空，Phase 6（pyrojewel-beamer-academic）无法编译。需安装 `texlive-xetex` 和 CJK 字体。
3. **端到端验证状态**：
   - Phase 0（入口分流）：✅ 逻辑已写入 SKILL.md
   - Phase 1（zotero-pdf-parse）：⚠️ skill 文件存在，但 Zotero 库无数据无法实测；env var 替换已完成
   - Phase 2（pyrojewel-paper）：⚠️ skill 文件存在，有 test-paper/content.md 可用，待用户触发 `/pyrojewel-paper` 实测
   - Phase 3（pyrojewel-paper-river）：⚠️ skill 文件存在，依赖 Phase 2 产出
   - Phase 4（pyrojewel-paper-qa）：⚠️ skill 文件存在，依赖 Phase 2 产出
   - Phase 5（汇总）：✅ 内置逻辑，无独立 skill
   - Phase 6（PPT）：❌ xelatex 未安装，无法编译
