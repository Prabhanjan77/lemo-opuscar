#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', '/films/payment-idempotency/index.html?preview=1')
            self.end_headers()
            return
        super().do_GET()
    def log_message(self, fmt, *args):
        if self.path.startswith('/films/payment-idempotency'):
            super().log_message(fmt, *args)

if __name__ == '__main__':
    import os
    os.chdir(ROOT)
    ThreadingHTTPServer(('0.0.0.0', 4173), Handler).serve_forever()
