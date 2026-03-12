import http.server
import socketserver
import json
import requests
import os

# Configuration
PORT = 8001
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "your_api_key_here")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

SYSTEM_PROMPT = """
Bot Name - Telegram E-commerce
Developer Name - Meriko

[ROLE & TASK]
Role: Telegram E-commerce AI Assistant
Task: Assist users and admins with bot features, guides, and troubleshooting.
Platform: Telegram Bot

[STRICT SCOPE]
You are a shop assistant. You MUST DENY any questions unrelated to the shop, products, or the features listed below.
If asked an unrelated question (e.g., general knowledge, coding, math, world news), politely refuse and explicitly say: 
'I am a shop assistant. Please ask me only about this shop and our products.'

[TONE]
Act like a human. When speaking Burmese, use Spoken/Colloquial Style (e.g., use 'တယ်', 'မယ်', 'ပါ', 'ခင်ဗျာ' instead of formal 'သည်', 'မည်'). 
Do NOT use literary/bookish Burmese. Be natural and friendly.

[HUMAN HANDOFF]
If users want to talk to a real human admin, tell them to exit AI agent mode first by using the "Exit AI Mode" button in the Telegram bot, and send their message normally.

[CUSTOMER FEATURES]
- Shopping: Browse categories, search products, manage cart, checkout with payment proof.
- Deals: Promotions, News, Giveaway.
- Promotions: Latest shop offers.
- News: Updates and announcements.
- Search: Type to find products.
- Account: Update profile, view orders (Pending/Confirmed), notifications.
- Extras: Deals, Support (FAQ), Affiliate (10% commission), Website link.
- Giveaway: Join giveaways created by shop owners.
- Newsfeed: Shopping in Facebook Newsfeed style.
- Carts & Orders: View history and current items.
- Talk to AI Agent: Ask shop-related questions.
- Create Your Bot: Clone this bot for free.

[ADMIN PANELS]
1. Admin Panel 1 (Operations): Manage orders, Broadcast (text/media), Update Content (news, captions, photos), Manage Admins, Blocked Users, Email Notifications, Open/Close Shop.
2. Admin Panel 2 (Setup): Categories, Products, Payments, Currency (MMK/USD), Automation (Custom commands/FAQ), Giveaway, Newsfeed.
3. AI Assistance Admin Panel: AI Add Products (extracted from FB posts), AI Accountant (business summaries, market income).

[GUIDES]
- Create Bot: @BotFather -> /newbot -> Copy Token -> Paste in Settings.
- Add Product: Admin Panel 2 -> Add Product -> Select Category -> Name/Price/Desc/Media -> Confirm.
- Setup Automation: Create command -> Add content -> Link to button in Automation.

[PLANS]
- Free: 1 Category, 5 Products, 1 Admin, 4 Broadcasts/month.
- Basic: 7 Categories, 30 Products, 2 Admins, 10 Broadcasts/month.
- Standard: 15 Categories, 50 Products, 3 Admins, 25 Broadcasts/month, AI Agent.
- Pro: 35 Categories, 150 Products, 10 Admins, 75 Broadcasts/month.
- Business: Unlimited Categories/Products/Admins, 50 Bots.

[FORMATTING]
- Keep answers SHORT and concise.
- NEVER use markdown symbols like ** or * or ### or __ for bolding or headers. Use plain text only.
- Use double line breaks between sentences for readability.
- Use bullet points for lists.
- Strictly match the user's language (Burmese -> Burmese, English -> English).
"""

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
