/* AI Chat Widget Logic */
document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget-container';
    chatWidget.innerHTML = `
        <button class="chat-trigger" id="chatTrigger">
            <i class="fa-solid fa-robot"></i>
        </button>
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div class="chat-header-info">
                    <i class="fa-solid fa-robot"></i>
                    <div>
                        <h4>AI Assistant</h4>
                        <span id="aiStatus">Online</span>
                    </div>
                </div>
                <button class="close-chat" id="closeChat">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message bot-message">
                    Mingalarbar! how can I help you today? I can answer everything about Telegram E-commerce.
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chatInput" placeholder="Type a message...">
                <button class="send-btn" id="sendBtn">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);

    const trigger = document.getElementById('chatTrigger');
    const window = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('closeChat');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesContainer = document.getElementById('chatMessages');

    let chatHistory = [];

    // Toggle Chat
    trigger.addEventListener('click', () => {
        window.classList.toggle('active');
        trigger.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        window.classList.remove('active');
        trigger.classList.remove('active');
    });

    // Send Message
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add user message to UI
        appendMessage('user', text);
        input.value = '';

        // Add loading indicator
        const loadingId = addLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });

            const data = await response.json();
            removeLoading(loadingId);

            if (data.choices && data.choices[0].message) {
                let botReply = data.choices[0].message.content;
                
                // Cleanup Markdown
                botReply = botReply.replace(/\*\*/g, '')
                                .replace(/\*/g, '')
                                .replace(/###/g, '')
                                .replace(/__/g, '');

                appendMessage('bot', botReply);
                
                // Update History
                chatHistory.push({ role: 'user', content: text });
                chatHistory.push({ role: 'assistant', content: botReply });
                if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
            } else {
                appendMessage('bot', "Sorry, I'm having trouble connecting to the AI. Please try again.");
            }
        } catch (error) {
            console.error('AI Error:', error);
            removeLoading(loadingId);
            appendMessage('bot', "Connection error. Make sure the proxy server is running.");
        }
    }

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-message`;
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addLoading() {
        const id = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message typing';
        loadingDiv.id = id;
        loadingDiv.innerText = 'AI is thinking...';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeLoading(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
