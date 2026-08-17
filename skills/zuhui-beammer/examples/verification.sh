#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL="$ROOT/SKILL.md"
THEME="$ROOT/assets/beamerthemeZuhuiBeammer.sty"
EXAMPLE="$ROOT/examples/minimal.tex"
PROMPTS="$ROOT/examples/test-prompts.json"

fail() { echo "FAIL: $*" >&2; exit 1; }

test -f "$SKILL" || fail "missing SKILL.md"
test -f "$THEME" || fail "missing beamerthemeZuhuiBeammer.sty"
test -f "$EXAMPLE" || fail "missing minimal.tex"
test -f "$PROMPTS" || fail "missing test-prompts.json"

head -1 "$SKILL" | grep -q '^---$' || fail "SKILL.md missing YAML frontmatter"
grep -q '^name: zuhui-beammer$' "$SKILL" || fail "wrong skill name"
grep -q '^description: >' "$SKILL" || fail "missing description"
grep -q 'zuhui-beammer' "$SKILL" || fail "missing exact trigger"
grep -q 'zuhui-beamer' "$SKILL" || fail "missing spelling alias"
grep -q 'ADC_Calibration.pdf' "$SKILL" || fail "missing PDF reference"
grep -q 'pyrojewel-beamer-academic' "$SKILL" || fail "missing inherited workflow"
grep -q 'page_manifest.tsv' "$SKILL" || fail "missing evidence manifest contract"
grep -q 'coverage_matrix.tsv' "$SKILL" || fail "missing coverage contract"
grep -q 'reported' "$SKILL" || fail "missing evidence statuses"
grep -q 'synthesized' "$SKILL" || fail "missing synthesized status"
grep -q 'project_result' "$SKILL" || fail "missing project_result status"
grep -q 'unknown' "$SKILL" || fail "missing unknown status"

for token in zuhui-red zuhui-green zuhui-blue zuhui-ink zuhui-gray zuhui-grid; do
  grep -q "definecolor{$token}" "$THEME" || fail "missing color token $token"
done
for command in zuhuiwatermark zuhuiresultlegend zuhuiquote; do
  grep -Fq "\\newcommand{\\${command}}" "$THEME" || fail "missing theme command $command"
done
grep -q 'ProvidesPackage{beamerthemeZuhuiBeammer}' "$THEME" || fail "wrong theme package name"
if grep -q 'beamerthemeAcademic' "$THEME"; then
  fail "independent Zuhui theme must not load parent theme"
fi

python3 -m json.tool "$PROMPTS" >/dev/null
grep -q 'beamerthemeZuhuiBeammer' "$EXAMPLE" || fail "example does not load Zuhui theme"
grep -q 'zuhuiframetitle' "$EXAMPLE" || fail "example does not exercise title primitive"
grep -q 'zuhuiresultlegend' "$EXAMPLE" || fail "example does not exercise result legend"
grep -q 'zuhuicode' "$EXAMPLE" || fail "example does not exercise code primitive"

echo "PASS: zuhui-beammer static checks"
