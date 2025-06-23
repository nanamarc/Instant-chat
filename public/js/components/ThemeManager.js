/**
 * Theme management component
 */
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('chat-theme') || 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.sunIcon = this.themeToggle.querySelector('.sun-icon');
        this.moonIcon = this.themeToggle.querySelector('.moon-icon');
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('chat-theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            this.sunIcon.classList.add('hidden');
            this.moonIcon.classList.remove('hidden');
        } else {
            this.sunIcon.classList.remove('hidden');
            this.moonIcon.classList.add('hidden');
        }
    }
}

window.ThemeManager = ThemeManager;