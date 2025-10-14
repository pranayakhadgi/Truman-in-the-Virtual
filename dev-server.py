#!/usr/bin/env python3
"""
Development server for Truman in the Virtual
Provides live reloading and CORS support for local development
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def start_dev_server(port=8000):
    """Start the development server with live reloading"""
    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            print(f"🚀 Development server running at http://localhost:{port}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print("🔄 Live editing enabled - changes will be reflected immediately")
            print("🌐 Opening browser...")
            
            # Open browser automatically
            webbrowser.open(f'http://localhost:{port}')
            
            print("\nPress Ctrl+C to stop the server")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Development server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Trying port {port + 1}")
            start_dev_server(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)

if __name__ == "__main__":
    start_dev_server()
