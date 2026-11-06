#!/usr/bin/env python3
"""
Servidor HTTP local de desenvolvimento com suporte completo a:
- Dual-stack IPv4 e IPv6 (localhost, 127.0.0.1, ::1 e rede local)
- HTTP Range Requests (HTTP 206 Partial Content) para vídeos MP4 fluidos
- Threading para requisições concorrentes sem bloqueio
"""

import functools
import http.server
import os
import re
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass

    def send_head(self):
        if 'Range' not in self.headers:
            return super().send_head()

        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()

        range_header = self.headers['Range']
        match = re.match(r'^bytes=(\d*)-(\d*)$', range_header.strip())
        if not match:
            return super().send_head()

        fsize = os.path.getsize(path)
        start_str, end_str = match.groups()

        if start_str and end_str:
            start = int(start_str)
            end = int(end_str)
        elif start_str:
            start = int(start_str)
            end = fsize - 1
        elif end_str:
            start = fsize - int(end_str)
            end = fsize - 1
        else:
            return super().send_head()

        if start >= fsize or start < 0 or end >= fsize or start > end:
            self.send_error(416, 'Requested Range Not Satisfiable')
            return None

        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, 'File not found')
            return None

        self.send_response(206)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Range', f'bytes {start}-{end}/{fsize}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(os.path.getmtime(path)))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()

        f.seek(start)
        length = end - start + 1

        class RangeFileWrapper:
            def __init__(self, fp, length):
                self.fp = fp
                self.remaining = length
            def read(self, size=-1):
                if self.remaining <= 0:
                    return b''
                if size < 0 or size > self.remaining:
                    size = self.remaining
                data = self.fp.read(size)
                self.remaining -= len(data)
                return data
            def close(self):
                self.fp.close()

        return RangeFileWrapper(f, length)

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    directory = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(RangeRequestHandler, directory=directory)

    # Usa o helper interno do Python para obter a melhor família de socket (dual-stack IPv4/IPv6 quando bind=None)
    ServerClass = ThreadingHTTPServer
    ServerClass.address_family, addr = http.server._get_best_family(None, port)
    server = ServerClass(addr, handler)

    print(f"Servidor HTTP ativo com suporte a Range em http://localhost:{port}/ e http://127.0.0.1:{port}/ (diretório: {directory})", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main()
