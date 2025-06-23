/**
 * Message rendering component
 */
class MessageRenderer {
    constructor(container) {
        this.container = container;
    }

    renderMessage(type, data) {
        const messageElement = this.createMessageElement(type, data);
        this.container.appendChild(messageElement);
        DOMUtils.scrollToBottom(this.container);
        return messageElement;
    }

    createMessageElement(type, data) {
        switch (type) {
            case 'own':
                return this.createOwnMessage(data);
            case 'other':
                return this.createOtherMessage(data);
            case 'system':
                return this.createSystemMessage(data);
            default:
                console.warn('Unknown message type:', type);
                return this.createSystemMessage({ text: 'Unknown message type' });
        }
    }

    createOwnMessage(data) {
        const messageDiv = DOMUtils.createElement('div', 'message message-own');
        
        const contentDiv = DOMUtils.createElement('div', 'message-content');
        
        const headerDiv = DOMUtils.createElement('div', 'message-header');
        headerDiv.innerHTML = `
            <span class="message-sender">You</span>
            <span class="message-time">${DateUtils.formatDateTime(data.dateTime)}</span>
        `;
        
        const bubbleDiv = DOMUtils.createElement('div', 'message-bubble');
        const textDiv = DOMUtils.createElement('div', 'message-text', DOMUtils.sanitizeHTML(data.text));
        
        bubbleDiv.appendChild(textDiv);
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    createOtherMessage(data) {
        const messageDiv = DOMUtils.createElement('div', 'message message-other');
        
        const contentDiv = DOMUtils.createElement('div', 'message-content');
        
        const headerDiv = DOMUtils.createElement('div', 'message-header');
        headerDiv.innerHTML = `
            <span class="message-sender">${DOMUtils.sanitizeHTML(data.name)}</span>
            <span class="message-time">${DateUtils.formatDateTime(data.dateTime)}</span>
        `;
        
        const bubbleDiv = DOMUtils.createElement('div', 'message-bubble');
        const textDiv = DOMUtils.createElement('div', 'message-text', DOMUtils.sanitizeHTML(data.text));
        
        bubbleDiv.appendChild(textDiv);
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    createSystemMessage(data) {
        const messageDiv = DOMUtils.createElement('div', 'message message-system');
        const systemDiv = DOMUtils.createElement('div', 'system-message', DOMUtils.sanitizeHTML(data.text || data));
        messageDiv.appendChild(systemDiv);
        return messageDiv;
    }

    renderExistingMessages(messages, currentUser) {
        messages.forEach(message => {
            if (message.is_update) {
                const text = message.sender_name === currentUser 
                    ? 'You have joined the chat'
                    : `${message.sender_name} ${message.content}`;
                this.renderMessage('system', { text });
            } else if (message.sender_name === currentUser) {
                this.renderMessage('own', {
                    name: message.sender_name,
                    text: message.content,
                    dateTime: message.date
                });
            } else {
                this.renderMessage('other', {
                    name: message.sender_name,
                    text: message.content,
                    dateTime: message.date
                });
            }
        });
    }

    clear() {
        this.container.innerHTML = '';
    }
}

window.MessageRenderer = MessageRenderer;