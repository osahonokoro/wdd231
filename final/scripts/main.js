// Main JavaScript module for navigation and shared functionality
import { StorageManager } from './storage.js';

class MainApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.init();
    }

    init() {
        this.setupMobileNavigation();
        this.applyUserPreferences();
        this.setupThemeToggle();
    }

    setupMobileNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navigation = document.querySelector('.navigation');

        if (hamburger && navigation) {
            hamburger.addEventListener('click', () => {
                navigation.classList.toggle('active');
                // Update aria-expanded for accessibility
                const isExpanded = navigation.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
            });

            // Close navigation when clicking on a link (mobile)
            navigation.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navigation.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    setupThemeToggle() {
        // This can be expanded for theme switching if needed
        const currentTheme = this.storageManager.getPreference('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
    }

    applyUserPreferences() {
        // Apply any stored user preferences
        const preferences = this.storageManager.getAllPreferences();
        // Implement preference application logic here
    }
}

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
});