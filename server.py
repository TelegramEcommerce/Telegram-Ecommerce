import http.server
import socketserver
import json
import requests
import os

# Load environment variables if .env exists
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if '=' in line:
                name, value = line.split('=', 1)
                os.environ[name.strip()] = value.strip()

# Configuration
PORT = 8001
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-939535e3073f4eaf8d54ec9b29657515")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# Load System Prompt from file for security
try:
    with open("system_context.txt", "r") as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    SYSTEM_PROMPT = "You are a helpful assistant."

class AIProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            user_message = data.get('message', '')
            history = data.get('history', [])
            
            # Construct messages for DeepSeek
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for msg in history:
                messages.append(msg)
            messages.append({"role": "user", "content": user_message})
            
            payload = {
                "model": "deepseek-chat",
                "messages": messages,
                "stream": False
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
            }
            
            try:
                response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers)
                ai_response = response.json()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(ai_response).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    print(f"Starting Secure AI Proxy Server on port {PORT}...")
    with socketserver.TCPServer(("", PORT), AIProxyHandler) as httpd:
        httpd.serve_forever()
