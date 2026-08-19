# RED Baseline: Workshop Talk Pipeline

Before the orchestration skill was written, a real pressured run exhibited the
failure shape captured by `test-prompts.json`:

- authoring started under `output/workshop-talks-rebuilt`, which is not the
  accepted delivery tree;
- a generic raw-evidence authoring pass produced validator-shaped text without
  page-specific semantic translation and analysis;
- handout compilation was started in reused directories and stale `.aux` files
  caused `Runaway argument`/incomplete PDF failures;
- background XeLaTeX jobs remained after interruption;
- creation of notes/PDF files was treated as progress before the full handoff,
  exact-once, image, A4, and two-pass compilation gates were complete.

This is the RED test for the new orchestration contract. The skill must force
the staging/final path distinction, serial checkpoints, fresh compile directory,
the required evidence handoff, and an explicit incomplete state on missing
evidence.
