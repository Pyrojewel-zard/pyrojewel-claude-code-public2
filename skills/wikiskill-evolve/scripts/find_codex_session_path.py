#!/usr/bin/env python3
"""Resolve a Codex/CCB session identifier to its JSONL transcript.

The helper is deliberately read-only. It verifies native Codex sessions using
the first ``session_meta`` record and resolves CCB identifiers through binding
or reconnect metadata before returning a path.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Iterable


PATH_FIELDS = ("codex_session_path", "session_path")
IDENTITY_FIELDS = (
    "ccb_session_id",
    "ccb_conversation_id",
    "codex_session_id",
    "codex_thread_id",
    "thread_id",
)


def _existing_file(value: object, *, relative_to: Path | None = None) -> Path | None:
    if not isinstance(value, str) or not value.strip():
        return None
    path = Path(value).expanduser()
    if not path.is_absolute() and relative_to is not None:
        path = relative_to / path
    try:
        path = path.resolve()
    except OSError:
        return None
    if path.is_symlink() or not path.is_file():
        return None
    return path


def _read_json(path: Path) -> dict[str, object] | None:
    try:
        with path.open("r", encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def _native_session_id(path: Path) -> str | None:
    """Read only the first JSONL record used for native identity validation."""
    try:
        with path.open("rb") as handle:
            first_line = handle.readline()
        record = json.loads(first_line)
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None
    if not isinstance(record, dict) or record.get("type") != "session_meta":
        return None
    payload = record.get("payload")
    if not isinstance(payload, dict):
        return None
    value = payload.get("id") or payload.get("session_id")
    return value if isinstance(value, str) else None


def _session_roots(root: Path) -> Iterable[Path]:
    """Yield likely Codex session directories below a user-supplied root."""
    try:
        root = root.expanduser().resolve()
    except OSError:
        return
    if root.name == "sessions" and root.is_dir():
        yield root
    home_sessions = root / "sessions"
    if home_sessions.is_dir():
        yield home_sessions
    if not root.is_dir():
        return
    try:
        for candidate in root.glob("**/provider-state/codex/home/sessions"):
            if candidate.is_dir():
                yield candidate
    except OSError:
        return


def _native_matches(session_id: str, roots: Iterable[Path]) -> set[Path]:
    matches: set[Path] = set()
    for root in roots:
        try:
            candidates = root.rglob(f"*{session_id}*.jsonl")
        except OSError:
            continue
        for candidate in candidates:
            if candidate.is_symlink() or not candidate.is_file():
                continue
            if _native_session_id(candidate) == session_id:
                try:
                    matches.add(candidate.resolve())
                except OSError:
                    continue
    return matches


def _ancestor_project_markers(start: Path) -> set[Path]:
    markers: set[Path] = set()
    try:
        current = start.expanduser().resolve()
    except OSError:
        current = start.absolute()
    if current.is_file():
        current = current.parent
    for directory in (current, *current.parents):
        try:
            markers.update(directory.glob(".ccb/.codex-*-session"))
        except OSError:
            continue
    return {path for path in markers if path.is_file()}


def _project_markers(roots: Iterable[Path]) -> set[Path]:
    markers: set[Path] = set()
    for root in roots:
        try:
            root = root.expanduser().resolve()
        except OSError:
            continue
        if root.is_file():
            if root.name.startswith(".codex-") and root.name.endswith("-session"):
                markers.add(root)
            continue
        if not root.is_dir():
            continue
        try:
            markers.update(root.glob(".ccb/.codex-*-session"))
            markers.update(root.glob("**/.ccb/.codex-*-session"))
        except OSError:
            continue
    return {path for path in markers if path.is_file()}


def _runtime_watchers() -> set[Path]:
    watchers: set[Path] = set()
    for raw_root in (
        os.environ.get("CCB_CALLER_RUNTIME_DIR"),
        os.environ.get("CODEX_RUNTIME_DIR"),
    ):
        if not raw_root:
            continue
        root = Path(raw_root).expanduser() / "reconnect" / "watchers"
        if root.is_dir():
            try:
                watchers.update(root.glob("*.json"))
            except OSError:
                continue
    return {path for path in watchers if path.is_file()}


def _binding_matches(
    path: Path,
    requested_id: str,
) -> tuple[set[Path], str | None]:
    data = _read_json(path)
    if data is None:
        return set(), None
    if not any(data.get(field) == requested_id for field in IDENTITY_FIELDS):
        return set(), None
    paths: set[Path] = set()
    for field in PATH_FIELDS:
        candidate = _existing_file(data.get(field), relative_to=path.parent)
        if candidate is not None:
            paths.add(candidate)
    bound_native_id = data.get("codex_session_id")
    return paths, bound_native_id if isinstance(bound_native_id, str) else None


def _default_roots() -> list[Path]:
    roots: list[Path] = []
    for raw in (
        os.environ.get("CODEX_SESSION_ROOT"),
        os.environ.get("CODEX_HOME"),
        os.environ.get("CCB_MANAGED_PROJECTS_ROOT"),
        str(Path.home() / ".local" / "ccb" / "projects"),
        str(Path.home() / ".codex"),
    ):
        if raw:
            roots.append(Path(raw))
    return roots


def resolve(session_id: str, roots: list[Path], project_roots: list[Path]) -> set[Path]:
    native_roots = list(_session_roots(root) for root in roots)
    flattened_roots = [path for group in native_roots for path in group]
    matches = _native_matches(session_id, flattened_roots)
    if matches:
        return matches

    marker_paths: set[Path] = set()
    marker_file = os.environ.get("CCB_SESSION_FILE")
    if marker_file:
        marker_paths.add(Path(marker_file).expanduser())
    marker_paths.update(_ancestor_project_markers(Path.cwd()))
    marker_paths.update(_project_markers(project_roots))
    marker_paths.update(_runtime_watchers())

    bound_native_ids: set[str] = set()
    for marker in marker_paths:
        binding_paths, native_id = _binding_matches(marker, session_id)
        matches.update(binding_paths)
        if native_id:
            bound_native_ids.add(native_id)

    if not matches and bound_native_ids:
        for native_id in bound_native_ids:
            matches.update(_native_matches(native_id, flattened_roots))
    return matches


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Resolve a Codex or CCB session ID to its JSONL transcript path."
    )
    parser.add_argument("session_id", help="Codex thread/session ID or CCB session ID")
    parser.add_argument(
        "--root",
        action="append",
        type=Path,
        default=[],
        help="Codex home, sessions directory, or parent of managed Codex homes",
    )
    parser.add_argument(
        "--project-root",
        action="append",
        type=Path,
        default=[],
        help="Project root(s) containing .ccb session markers",
    )
    parser.add_argument("--json", action="store_true", help="emit a JSON result")
    args = parser.parse_args(argv)

    roots = list(dict.fromkeys([*args.root, *_default_roots()]))
    project_roots = list(dict.fromkeys([*args.project_root, Path.cwd()]))
    matches = sorted(resolve(args.session_id, roots, project_roots), key=str)

    if args.json:
        print(json.dumps({"session_id": args.session_id, "matches": [str(p) for p in matches]}))
        if not matches:
            return 1
        if len(matches) > 1:
            return 2
    elif len(matches) == 1:
        print(matches[0])
    elif not matches:
        print(f"session not found: {args.session_id}", file=sys.stderr)
        return 1
    else:
        print(f"multiple verified sessions found for: {args.session_id}", file=sys.stderr)
        for path in matches:
            print(path, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
