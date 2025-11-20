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
import socket
from urllib.parse import urlparse, unquote

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, public_dir=None, **kwargs):
        self.public_dir = public_dir
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Override do_GET to handle /public/ paths and route aliases"""
        # Parse the path
        parsed_path = self.path.split('?', 1)[0]  # Remove query string
        
        # Route aliases (map backend routes to frontend files)
        route_aliases = {
            '/': 'welcome.html',
            '/queries': 'queries.html',
            '/tour': 'index.html',
            '/transition': 'transition.html',
            '/placeholder': 'placeholder.html',
            '/welcome-flow': 'welcome-flow.html'
        }
        
        # Check if path is a route alias
        if parsed_path in route_aliases:
            file_name = route_aliases[parsed_path]
            file_path = os.path.join(os.getcwd(), file_name)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                try:
                    with open(file_path, 'rb') as f:
                        content = f.read()
                    content_type = 'text/html'
                    self.send_response(200)
                    self.send_header('Content-type', content_type)
                    self.send_header('Content-length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception as e:
                    self.send_error(500, f"Error reading file: {str(e)}")
                    return
        
        # Handle /public/ paths
        if parsed_path.startswith('/public/'):
            if self.public_dir:
                file_path = parsed_path[8:]  # Remove '/public/'
                # URL decode the path to handle spaces and special characters
                file_path = unquote(file_path)
                full_path = os.path.join(self.public_dir, file_path)
                if os.path.exists(full_path) and os.path.isfile(full_path):
                    try:
                        with open(full_path, 'rb') as f:
                            content = f.read()
                        # Determine content type
                        if full_path.endswith('.svg'):
                            content_type = 'image/svg+xml'
                        elif full_path.endswith('.png'):
                            content_type = 'image/png'
                        elif full_path.endswith('.jpg') or full_path.endswith('.jpeg'):
                            content_type = 'image/jpeg'
                        elif full_path.endswith('.js'):
                            content_type = 'application/javascript'
                        elif full_path.endswith('.css'):
                            content_type = 'text/css'
                        elif full_path.endswith('.txt'):
                            content_type = 'text/plain'
                        else:
                            content_type = 'application/octet-stream'
                        
                        self.send_response(200)
                        self.send_header('Content-type', content_type)
                        self.send_header('Content-length', str(len(content)))
                        self.end_headers()
                        self.wfile.write(content)
                        return
                    except Exception as e:
                        self.send_error(500, f"Error reading file: {str(e)}")
                        return
                else:
                    self.send_error(404, f"File not found: {parsed_path}")
                    return
        
        # For all other paths, use default behavior (serves from current directory)
        super().do_GET()
    
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
        # Get directories
        script_dir = os.path.dirname(os.path.abspath(__file__))  # Frontend directory
        project_root = os.path.dirname(script_dir)  # Project root
        public_dir = os.path.join(project_root, 'public')
        
        # Change to Frontend directory so files are served from there
        os.chdir(script_dir)
        
        # Get local IP address for network access
        try:
            host_ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            host_ip = "127.0.0.1"

        # Create a custom handler factory
        def handler_factory(*args, **kwargs):
            return CORSHTTPRequestHandler(*args, public_dir=public_dir, **kwargs)

        with socketserver.TCPServer(("0.0.0.0", port), handler_factory) as httpd:
            print(f"🚀 Truman Virtual Tour Development Server")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🌐 Local:   http://localhost:{port}/welcome.html")
            print(f"🌐 Network: http://{host_ip}:{port}/welcome.html")
            print(f"🌐 3D Tour: http://{host_ip}:{port}/index.html")
            print("🔄 Live editing enabled - changes will be reflected immediately")
            print("\nPress Ctrl+C to stop the server")

            # Optional: Open only the local version in browser (safe)
            webbrowser.open(f"http://localhost:{port}/welcome.html")

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
