// ES Module for local storage management
export class StorageManager {
    constructor() {
        this.prefix = 'aquaculture_';
    }

    savePreference(key, value) {
        try {
            localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getPreference(key) {
        try {
            const item = localStorage.getItem(`${this.prefix}${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    getAllPreferences() {
        const preferences = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const preferenceKey = key.replace(this.prefix, '');
                preferences[preferenceKey] = this.getPreference(preferenceKey);
            }
        }
        return preferences;
    }

    clearPreferences() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}