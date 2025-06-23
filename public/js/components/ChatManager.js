/**
 * Chat management component
 */
class ChatManager {
    constructor(socket) {
        this.socket = socket;
        this.currentUser = null;
        this.currentRoom = null;
        this.isTyping = false;
        this.typingTimeout = null;
        
        // DOM elements
        this.chatSection = document.getElementById('chat-section');
        this.currentRoomElement = document.getElementById('current-room');
        this.messagesList = document.getElementById('messages-list');
        this.messageForm = document.getElementById('message-form');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = this.messageForm.querySelector('.send-btn');
        this.membersList = document.getElementById('members-list');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.typingText = document.getElementById('typing-text');
        this.leaveChatBtn = document.getElementById('leave-chat');
        
        // Components
        this.messageRenderer = new MessageRenderer(this.messagesList);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    setupEventListeners() {
        // Message form
        this.messageForm.addEventListener('submit', (e) => this.handleSendMessage(e));
        
        // Typing indicators
        this.messageInput.addEventListener('input', 
            DOMUtils.debounce(() => this.handleTyping(), 300)
        );
        
        this.messageInput.addEventListener('focus', () => this.handleStartTyping());
        this.messageInput.addEventListener('blur', () => this.handleStopTyping());
        
        // Leave chat
        this.leaveChatBtn.addEventListener('click', () => this.handleLeaveChat());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeInput());
    }

    setupSocketListeners() {
        this.socket.on('existingMessages', (messages) => {
            this.messageRenderer.renderExistingMessages(messages, this.currentUser);
        });

        this.socket.on('chat', (message) => {
            this.messageRenderer.renderMessage('other', message);
            this.playNotificationSound();
        });

        this.socket.on('update', (message) => {
            this.messageRenderer.renderMessage('system', { text: message });
        });

        this.socket.on('leave', (message) => {
            this.messageRenderer.renderMessage('system', { text: message });
        });

        this.socket.on('userList', (users) => {
            this.updateMembersList(users);
        });

        this.socket.on('typing', (message) => {
            this.showTypingIndicator(message);
        });

        this.socket.on('stopTyping', () => {
            this.hideTypingIndicator();
        });
    }

    joinRoom(userData) {
        this.currentUser = userData.username;
        this.currentRoom = userData.room;
        
        // Update UI
        this.currentRoomElement.textContent = userData.room;
        this.show();
        
        // Emit socket events
        this.socket.emit('login', userData);
        this.socket.emit('update', userData);
        this.socket.emit('updateList', userData);
        
        // Focus message input
        this.messageInput.focus();
    }

    handleSendMessage(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        const messageData = {
            name: this.currentUser,
            text: message,
            dateTime: DateUtils.getCurrentDateTime()
        };
        
        // Render own message
        this.messageRenderer.renderMessage('own', messageData);
        
        // Send to server
        this.socket.emit('chat', messageData);
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeInput();
        this.handleStopTyping();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.handleStartTyping();
        }
        
        // Reset typing timeout
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.handleStopTyping();
        }, 2000);
    }

    handleStartTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', this.currentUser);
        }
    }

    handleStopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.socket.emit('stopTyping');
            clearTimeout(this.typingTimeout);
        }
    }

    handleLeaveChat() {
        if (confirm('Are you sure you want to leave the chat?')) {
            this.socket.emit('leave', this.currentUser);
            this.hide();
            // Reset and show login
            window.app.showLogin();
        }
    }

    updateMembersList(users) {
        this.membersList.innerHTML = '';
        
        users.forEach(user => {
            const memberDiv = DOMUtils.createElement('div', 'member-item');
            
            const avatarDiv = DOMUtils.createElement('div', 'member-avatar');
            avatarDiv.textContent = DOMUtils.getInitials(user);
            
            const nameDiv = DOMUtils.createElement('div', 'member-name');
            nameDiv.textContent = user === this.currentUser ? 'You' : user;
            
            memberDiv.appendChild(avatarDiv);
            memberDiv.appendChild(nameDiv);
            this.membersList.appendChild(memberDiv);
        });
    }

    showTypingIndicator(message) {
        this.typingText.textContent = message;
        this.typingIndicator.classList.remove('hidden');
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    playNotificationSound() {
        // Create a simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    show() {
        this.chatSection.classList.remove('hidden');
    }

    hide() {
        this.chatSection.classList.add('hidden');
        this.messageRenderer.clear();
        this.membersList.innerHTML = '';
        this.hideTypingIndicator();
    }
}

window.ChatManager = ChatManager;