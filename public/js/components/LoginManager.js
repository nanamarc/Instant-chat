/**
 * Login management component
 */
class LoginManager {
    constructor(onLogin) {
        this.onLogin = onLogin;
        this.loginSection = document.getElementById('login-section');
        this.loginForm = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username');
        this.roomInput = document.getElementById('room-name');
        
        this.init();
    }

    init() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Auto-focus username input
        this.usernameInput.focus();
        
        // Handle Enter key in room input
        this.roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin(e);
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();
        
        const username = this.usernameInput.value.trim();
        const room = this.roomInput.value.trim() || 'Global';
        
        if (!username) {
            this.showError('Please enter your name');
            return;
        }

        if (username.length < 2) {
            this.showError('Name must be at least 2 characters long');
            return;
        }

        if (username.length > 20) {
            this.showError('Name must be less than 20 characters');
            return;
        }

        const userData = { username, room };
        this.onLogin(userData);
        this.hide();
    }

    showError(message) {
        // Remove existing error
        const existingError = this.loginForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorDiv = DOMUtils.createElement('div', 'error-message');
        errorDiv.style.cssText = `
            color: var(--error-color);
            font-size: 0.875rem;
            margin-top: var(--spacing-sm);
            padding: var(--spacing-sm);
            background: rgba(239, 68, 68, 0.1);
            border-radius: var(--radius-sm);
            border: 1px solid rgba(239, 68, 68, 0.2);
        `;
        errorDiv.textContent = message;
        
        this.loginForm.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    hide() {
        this.loginSection.classList.add('hidden');
    }

    show() {
        this.loginSection.classList.remove('hidden');
        this.usernameInput.focus();
    }

    reset() {
        this.usernameInput.value = '';
        this.roomInput.value = '';
        const errorMessage = this.loginForm.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

window.LoginManager = LoginManager;