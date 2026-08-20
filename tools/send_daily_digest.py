"""Send daily paper digest email via SMTP."""

from __future__ import annotations

import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Sequence


def _load_env() -> dict:
    env = {}
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def _build_html_body(date: str, enriched_path: str) -> tuple[str, int, int, int]:
    """Build HTML email body from enriched JSONL.

    Returns (html, total, high_priority, worth_reading).
    """
    buckets = {"high_priority": 0, "worth_reading": 0, "archive": 0, "filtered": 0}
    papers: list[dict] = []

    with open(enriched_path, "r", encoding="utf-8") as f:
        for line in f:
            p = json.loads(line)
            rel = p.get("rfic_relevance", {})
            bucket = rel.get("priority_bucket", "filtered")
            buckets[bucket] = buckets.get(bucket, 0) + 1
            papers.append(p)

    total = len(papers)
    high = buckets.get("high_priority", 0)
    worth = buckets.get("worth_reading", 0)

    # Build top papers list (high_priority first, then worth_reading)
    def _sort_key(p: dict) -> int:
        rel = p.get("rfic_relevance", {})
        return -rel.get("overall_score_100", 0)

    interesting = [p for p in papers
                   if p.get("rfic_relevance", {}).get("priority_bucket") in
                   ("high_priority", "worth_reading")]
    interesting.sort(key=_sort_key)

    rows = ""
    for p in interesting[:30]:
        rel = p.get("rfic_relevance", {})
        score = rel.get("overall_score_100", 0)
        bucket = rel.get("priority_bucket", "")
        tag = rel.get("coarse_primary_tag", "")
        title = p.get("title", "")
        ai = p.get("AI", {})
        tldr = ai.get("translated_tldr", "") or ai.get("tldr", "") or p.get("summary", "")
        url = p.get("abs", p.get("url", ""))
        badge = "🔴" if bucket == "high_priority" else "🟡"

        rows += f"""
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">{badge} {score}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">
                <a href="{url}" style="color:#1a73e8;text-decoration:none;font-weight:500">{title}</a>
                <br><span style="color:#666;font-size:13px">{tldr[:200]}</span>
                <br><span style="color:#999;font-size:12px">{tag}</span>
            </td>
        </tr>"""

    html = f"""<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:0 auto;padding:20px">
    <h2 style="color:#1a73e8">📄 Daily arXiv Digest — {date}</h2>
    <p style="color:#666;font-size:14px">
        Total papers: <strong>{total}</strong> |
        🔴 High priority: <strong>{high}</strong> |
        🟡 Worth reading: <strong>{worth}</strong>
    </p>
    <p style="color:#999;font-size:12px">
        Scoring coverage: {buckets.get('archive',0)} archive / {buckets.get('filtered',0)} filtered
    </p>
    <table style="width:100%;border-collapse:collapse">
        <thead><tr>
            <th style="text-align:left;padding:8px;background:#f5f5f5;width:60px">Score</th>
            <th style="text-align:left;padding:8px;background:#f5f5f5">Paper</th>
        </tr></thead>
        <tbody>{rows}</tbody>
    </table>
    <p style="color:#999;font-size:12px;margin-top:20px">
        Full results: <a href="http://10.112.170.77:4869" style="color:#1a73e8">http://10.112.170.77:4869</a>
    </p>
</body></html>"""

    return html, total, high, worth


def _send(sender: str, password: str, receiver: str, smtp_server: str,
          smtp_port: int, msg: MIMEMultipart) -> bool:
    """Shared SMTP send. Returns True on success."""
    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=30) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, [receiver], msg.as_string())
        print(f"[mailer] Email sent to {receiver} — {msg['Subject']}")
        return True
    except Exception as e:
        print(f"[mailer] Failed to send email: {e}")
        return False


def send_email(subject: str, html: str, text: str | None = None) -> bool:
    """Send a generic email with the configured SMTP account.

    Args:
        subject: Email subject line.
        html: HTML body (preferred; also used as plain text if text is None).
        text: Optional plain-text alternative body.

    Returns True on success, False if SMTP is not configured or send fails.
    """
    env = _load_env()

    smtp_server = env.get("SMTP_SERVER", "smtp.bupt.edu.cn")
    smtp_port = int(env.get("SMTP_PORT", "587"))
    sender = env.get("SENDER", "")
    password = env.get("SENDER_PASSWORD", "")
    receiver = env.get("RECEIVER", "")

    if not sender or not password or not receiver:
        print("[mailer] SMTP not configured, skipping email.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver
    msg.attach(MIMEText(text if text is not None else html, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    return _send(sender, password, receiver, smtp_server, smtp_port, msg)


def send_daily_digest(date: str, enriched_path: str) -> bool:
    """Send daily paper digest email. Returns True on success."""
    env = _load_env()

    smtp_server = env.get("SMTP_SERVER", "smtp.bupt.edu.cn")
    smtp_port = int(env.get("SMTP_PORT", "587"))
    sender = env.get("SENDER", "")
    password = env.get("SENDER_PASSWORD", "")
    receiver = env.get("RECEIVER", "")

    if not sender or not password or not receiver:
        print("[mailer] SMTP not configured, skipping email.")
        return False

    html_body, total, high, worth = _build_html_body(date, enriched_path)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[arXiv] {date} — {total} papers ({high} high priority, {worth} worth reading)"
    msg["From"] = sender
    msg["To"] = receiver
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    return _send(sender, password, receiver, smtp_server, smtp_port, msg)


def main() -> int:
    """CLI entry for generic sending.

    Examples:
        python send_daily_digest.py --subject "Daily sync report" --body-file report.html --html
        python send_daily_digest.py --subject "Daily sync report" --body "All done."
    """
    import argparse

    ap = argparse.ArgumentParser(description="Send email via configured SMTP")
    ap.add_argument("--subject", required=True, help="Email subject")
    ap.add_argument("--body", help="Inline body text/HTML")
    ap.add_argument("--body-file", help="Read body from file")
    ap.add_argument("--html", action="store_true",
                    help="Treat body as HTML (also attach plain-text fallback)")
    args = ap.parse_args()

    if args.body_file:
        body = Path(args.body_file).read_text(encoding="utf-8")
    elif args.body:
        body = args.body
    else:
        ap.error("either --body or --body-file is required")

    if args.html:
        ok = send_email(args.subject, html=body)
    else:
        ok = send_email(args.subject, html=f"<pre>{body}</pre>", text=body)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
