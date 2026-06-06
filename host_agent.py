#!/usr/bin/env python3
"""
SWOWL Host Agent — runs natively on macOS, listens on port 8002.
Receives commands from the Docker backend via host.docker.internal
and executes them on the host (e.g. open Finder at a given path).

Usage:
    python3 host_agent.py

To auto-start at login, add to macOS Login Items:
    System Settings → General → Login Items → + → select host_agent.py
    (or drag this script onto Script Editor and export as Application)
"""
import http.server
import subprocess
import urllib.parse
import json
import sys

PORT = 8002


class AgentHandler(http.server.BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        # Suppress default access log noise
        pass

    def _respond(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._respond(200, {"status": "ok", "agent": "swowl-host-agent"})
        else:
            self._respond(404, {"error": "not found"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        params = dict(urllib.parse.parse_qsl(parsed.query))

        if parsed.path == "/reveal":
            path = params.get("path", "")
            if not path:
                return self._respond(400, {"error": "path is required"})
            import os
            # If it's a file, open its parent directory; if directory, open it
            target = path if os.path.isdir(path) else os.path.dirname(path)
            if not target:
                return self._respond(400, {"error": "invalid path"})
            subprocess.Popen(["open", target])
            print(f"  → Finder: {target}")
            self._respond(200, {"revealed": target})
        else:
            self._respond(404, {"error": "unknown command"})


if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", PORT), AgentHandler)
    print(f"SWOWL Host Agent running on port {PORT}")
    print(f"Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        sys.exit(0)
