/**
 * Main application controller
 */
class ChatApp {
    constructor() {
        this.socket = io();
        this.themeManager = new ThemeManager();
        this.loginManager = new LoginManager((userData) => this.handleLogin(userData));
        this.chatManager = new ChatManager(this.socket);
        
        this.init();
    }

    init() {
        // Initialize the app
        this.showLogin();
        
        // Handle connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.handleDisconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.handleConnectionError();
        });
    }

    handleLogin(userData) {
        this.chatManager.joinRoom(userData);
    }

    showLogin() {
        this.loginManager.show();
        this.loginManager.reset();
        this.chatManager.hide();
    }

    handleDisconnect() {
        // Show a reconnection message or redirect to login
        console.log('Connection lost. Please refresh the page.');
    }

    handleConnectionError() {
        // Handle connection errors
        console.log('Failed to connect to server. Please check your connection.');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChatApp();
});