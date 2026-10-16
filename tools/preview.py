#!/usr/bin/env python3
"""
Preview the website properly on your own computer.

Just run:   python tools/preview.py
Or on Windows, double-click  start-site.bat  in the site folder.

WHY THIS IS NEEDED
Double-clicking index.html opens it as a *file*. Browsers will not let a page
opened that way read other files from your disk - a security rule, not a fault
in the site. The gallery, the publications list and the research highlights are
all loaded from the files in data/, so they come up empty.

This script serves the folder as a real (local) website, which is exactly how it
will behave once it is online. Everything appears.

Press Ctrl+C in the black window to stop it.
"""
import http.server
import os
import socketserver
import sys
import threading
import webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Never cache while previewing, so edits show up on refresh.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        msg = fmt % args
        if " 200 " not in msg:        # only complain about problems
            sys.stderr.write("   " + msg + "\n")


def find_port(start=8000, tries=20):
    import socket
    for port in range(start, start + tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return None


def main():
    port = find_port()
    if port is None:
        print("Could not find a free port between 8000 and 8019.")
        input("Press Enter to close.")
        return 1

    url = f"http://localhost:{port}"
    print()
    print("  Your website is now running at:")
    print(f"      {url}")
    print()
    print("  A browser window should open by itself.")
    print("  Leave this window open while you look at the site.")
    print("  Press Ctrl+C here when you are finished.")
    print()

    threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Nothing was changed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
