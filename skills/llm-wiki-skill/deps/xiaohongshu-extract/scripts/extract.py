#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "playwright>=1.40.0",
#     "requests>=2.28.0",
#     "beautifulsoup4>=4.12.0",
# ]
# ///
"""
Xiaohongshu post extractor wrapper.

Wraps xhs-extractor (https://github.com/asimovVong/xhs-extractor) with
uv run --script dependency resolution and login state management.

Features:
- Auto-clone xhs-extractor on first run
- Login state verification before extraction
- Auto-refresh login state via headless page visit
- Extract post content via xhs-extractor CLI

Usage:
    uv run extract.py --text-only "分享文本或URL"
    uv run extract.py "分享文本或URL"
    uv run extract.py --login          # interactive login (requires display)
    uv run extract.py --verify         # verify login state
    uv run extract.py --install-browser
"""

import argparse
import json
import os
import subprocess
import sys
import time


SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XHS_DATA_DIR = os.path.join(os.path.expanduser("~"), ".local", "share", "xiaohongshu-extract")
XHS_STATE_PATH = os.path.join(XHS_DATA_DIR, "xhs_state.json")
XHS_CACHE_DIR = os.path.expanduser("~/.cache/xhs-extractor")
XHS_REPO_URL = "https://github.com/asimovVong/xhs-extractor.git"

# How long before we consider the state stale (seconds)
STATE_STALE_THRESHOLD = 7 * 24 * 3600  # 7 days


def ensure_xhs_extractor():
    """Clone xhs-extractor to cache dir if not present, or pull updates."""
    marker = os.path.join(XHS_CACHE_DIR, "xhs_extractor_module")
    if os.path.isdir(marker):
        # Try to pull latest changes (non-blocking, failure is OK)
        subprocess.run(
            ["git", "pull", "--ff-only"],
            cwd=XHS_CACHE_DIR,
            capture_output=True,
        )
        return XHS_CACHE_DIR

    print(f"首次运行：克隆 xhs-extractor 到 {XHS_CACHE_DIR}...", file=sys.stderr)
    result = subprocess.run(
        ["git", "clone", "--depth", "1", XHS_REPO_URL, XHS_CACHE_DIR],
        capture_output=True,
    )
    if result.returncode != 0:
        print(f"克隆失败：{result.stderr.decode()}", file=sys.stderr)
        sys.exit(1)

    if not os.path.isdir(marker):
        print("克隆成功但未找到 xhs_extractor_module 目录", file=sys.stderr)
        sys.exit(1)

    return XHS_CACHE_DIR


def check_login_state():
    """Check if xhs_state.json exists and is not obviously stale."""
    # Check primary location
    if os.path.isfile(XHS_STATE_PATH):
        try:
            stat = os.stat(XHS_STATE_PATH)
            age = time.time() - stat.st_mtime
            if age > STATE_STALE_THRESHOLD:
                print(
                    f"警告：登录态已超过 {int(age / 86400)} 天未更新，可能已过期",
                    file=sys.stderr,
                )
            return True
        except OSError:
            return False

    # Migrate from old location (project dir)
    old_path = os.path.join(SKILL_DIR, "scripts", "xhs_state.json")
    if os.path.isfile(old_path):
        import shutil
        os.makedirs(XHS_DATA_DIR, exist_ok=True)
        shutil.move(old_path, XHS_STATE_PATH)
        print(f"登录态已迁移到 {XHS_STATE_PATH}", file=sys.stderr)
        return True

    # Check cache dir (user may have placed it there)
    cache_state = os.path.join(XHS_CACHE_DIR, "xhs_state.json")
    if os.path.isfile(cache_state):
        import shutil
        os.makedirs(XHS_DATA_DIR, exist_ok=True)
        shutil.copy2(cache_state, XHS_STATE_PATH)
        return True

    return False


def verify_login_state():
    """Verify login state by visiting Xiaohongshu in headless mode
    and checking if we get redirected to login page."""
    if not os.path.isfile(XHS_STATE_PATH):
        print("登录态文件不存在", file=sys.stderr)
        return False

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(storage_state=XHS_STATE_PATH)
            page = context.new_page()

            page.goto("https://www.xiaohongshu.com", wait_until="networkidle", timeout=15000)

            current_url = page.url
            context.close()
            browser.close()

            if "login" in current_url or "signin" in current_url:
                print("登录态已过期（被重定向到登录页）", file=sys.stderr)
                return False

            print("登录态有效", file=sys.stderr)
            return True

    except Exception as e:
        print(f"验证登录态时出错：{e}", file=sys.stderr)
        return False


def interactive_login():
    """Launch interactive login flow (requires a display).

    Starts a headed Playwright browser to the Xiaohongshu login page.
    After the user logs in manually, the browser state is saved.
    """
    # Check for display
    display = os.environ.get("DISPLAY", "")
    if not display and not os.environ.get("WAYLAND_DISPLAY", ""):
        print(
            "错误：需要图形界面才能登录小红书\n"
            "请在有显示器的环境中运行（或在 WSL 中配置 X11转发）",
            file=sys.stderr,
        )
        sys.exit(1)

    from playwright.sync_api import sync_playwright

    print("启动浏览器，请在弹出窗口中登录小红书...", file=sys.stderr)
    print("登录成功后页面会自动跳转，脚本将自动保存登录态", file=sys.stderr)
    print("（如果长时间未弹出窗口，请检查是否被系统阻止）", file=sys.stderr)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to Xiaohongshu login page
        page.goto("https://www.xiaohongshu.com")

        # Give user 30 seconds to log in, then auto-save state
        print("请在弹出浏览器中登录小红书，30 秒后自动保存登录态...", file=sys.stderr)
        page.wait_for_timeout(30000)

        # Small delay to let cookies settle
        page.wait_for_timeout(2000)

        # Save state
        os.makedirs(XHS_DATA_DIR, exist_ok=True)
        context.storage_state(path=XHS_STATE_PATH)
        print(f"登录态已保存到 {XHS_STATE_PATH}", file=sys.stderr)

        # Also save to xhs_extractor_module dir for the extraction module
        xhs_dir = ensure_xhs_extractor()
        xhs_module_dir = os.path.join(xhs_dir, "xhs_extractor_module")
        import shutil
        shutil.copy2(XHS_STATE_PATH, os.path.join(xhs_module_dir, "xhs_state.json"))

        context.close()
        browser.close()

    print("登录完成！现在可以使用小红书提取功能了", file=sys.stderr)


def refresh_login_state():
    """Attempt to refresh login state by visiting a page in headless mode.

    If the cookies are still valid but just stale, a page visit can
    refresh them (some sites extend session on activity). This writes
    the refreshed state back to the state file.
    """
    if not os.path.isfile(XHS_STATE_PATH):
        return False

    print("尝试刷新登录态...", file=sys.stderr)

    xhs_dir = ensure_xhs_extractor()
    xhs_module_dir = os.path.join(xhs_dir, "xhs_extractor_module")
    target_state = os.path.join(xhs_module_dir, "xhs_state.json")

    import shutil
    shutil.copy2(XHS_STATE_PATH, target_state)

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(storage_state=target_state)
            page = context.new_page()

            page.goto("https://www.xiaohongshu.com", wait_until="networkidle", timeout=15000)

            # Check if we got redirected to login
            current_url = page.url
            if "login" in current_url or "signin" in current_url:
                print("登录态已失效，无法刷新", file=sys.stderr)
                context.close()
                browser.close()
                return False

            # Save refreshed state
            context.storage_state(path=target_state)
            context.close()
            browser.close()

        # Copy refreshed state back to skill dir
        shutil.copy2(target_state, XHS_STATE_PATH)
        print("登录态已刷新", file=sys.stderr)
        return True

    except Exception as e:
        print(f"刷新登录态失败：{e}", file=sys.stderr)
        return False


def install_browser():
    """Install Playwright Chromium browser."""
    print("安装 Playwright Chromium 浏览器（约 150MB）...", file=sys.stderr)
    result = subprocess.run(
        [sys.executable, "-m", "playwright", "install", "chromium"],
    )
    if result.returncode != 0:
        print("Chromium 安装失败", file=sys.stderr)
        sys.exit(1)
    print("Chromium 安装完成", file=sys.stderr)


def extract(input_text, text_only=False, ocr=False):
    """Extract post content using xhs-extractor CLI."""
    xhs_dir = ensure_xhs_extractor()
    xhs_module_dir = os.path.join(xhs_dir, "xhs_extractor_module")

    # Ensure state file is accessible to xhs_extractor_module
    target_state = os.path.join(xhs_module_dir, "xhs_state.json")
    if os.path.isfile(XHS_STATE_PATH):
        import shutil
        shutil.copy2(XHS_STATE_PATH, target_state)

    # Build command
    cmd = [sys.executable, "-m", "xhs_extractor_module.cli"]

    if text_only:
        cmd.append("--text-only")
    if ocr:
        cmd.append("--ocr")

    cmd.append(input_text)

    env = os.environ.copy()
    env["PYTHONPATH"] = xhs_dir

    result = subprocess.run(
        cmd,
        cwd=xhs_dir,
        env=env,
    )

    return result.returncode


def main():
    parser = argparse.ArgumentParser(
        description="Extract Xiaohongshu post content"
    )
    parser.add_argument(
        "input",
        nargs="?",
        help="分享文本或 URL",
    )
    parser.add_argument(
        "--text-only", "-t",
        action="store_true",
        help="只输出纯文本内容，不含标题和装饰",
    )
    parser.add_argument(
        "--install-browser",
        action="store_true",
        help="安装 Playwright Chromium 浏览器",
    )
    parser.add_argument(
        "--login",
        action="store_true",
        help="启动交互式登录流程（需要图形界面）",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证当前登录态是否有效",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="尝试刷新登录态（通过 headless 浏览器访问小红书）",
    )
    parser.add_argument(
        "--ocr",
        action="store_true",
        help="启用 OCR 图片文字识别（需要 paddleocr）",
    )
    args = parser.parse_args()

    # Handle utility commands
    if args.install_browser:
        install_browser()
        return

    if args.login:
        interactive_login()
        return

    if args.verify:
        valid = verify_login_state()
        sys.exit(0 if valid else 1)

    if args.refresh:
        success = refresh_login_state()
        sys.exit(0 if success else 1)

    if not args.input:
        parser.error("需要提供分享文本或 URL（或使用 --login/--verify/--refresh/--install-browser）")

    # Check login state
    if not check_login_state():
        print(
            "错误：小红书登录态未配置（缺少 xhs_state.json）\n"
            "请运行以下命令完成首次登录配置：\n"
            f"  uv run {os.path.abspath(__file__)} --login\n"
            "（需要图形界面，请在有显示器的环境中运行）",
            file=sys.stderr,
        )
        sys.exit(1)

    # Try to refresh stale state before extraction
    stat = os.stat(XHS_STATE_PATH)
    age = time.time() - stat.st_mtime
    if age > STATE_STALE_THRESHOLD:
        print("登录态较旧，尝试刷新...", file=sys.stderr)
        if not refresh_login_state():
            print(
                "刷新失败，登录态可能已过期\n"
                "请运行以下命令重新登录：\n"
                f"  uv run {os.path.abspath(__file__)} --login",
                file=sys.stderr,
            )
            # Still try extraction — maybe the cookies are still valid

    # Extract
    exit_code = extract(args.input, text_only=args.text_only, ocr=args.ocr)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()