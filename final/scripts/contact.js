// contact.js - Form validation and handling for contact page

class StorageManager {
    savePreference(key, value) {
        try {
            localStorage.setItem(`aquaculture_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    getPreference(key) {
        try {
            const item = localStorage.getItem(`aquaculture_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    removePreference(key) {
        localStorage.removeItem(`aquaculture_${key}`);
    }
}

class ContactForm {
    constructor() {
        this.storageManager = new StorageManager();
        this.form = document.getElementById('contactForm');
        this.saveDraftBtn = document.getElementById('saveDraft');
        this.submitBtn = document.getElementById('submitBtn');
        this.formStatus = document.getElementById('formStatus');
        this.init();
    }

    init() {
        this.loadDraft();
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showError('Please fix the errors in the form before submitting.');
            } else {
                this.showLoading(true);
                this.clearDraft();
                // Form submits to form-action.html
            }
        });

        if (this.saveDraftBtn) {
            this.saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        const resetBtn = this.form.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.clearDraft();
                this.hideStatus();
            });
        }

        this.setupAutoSave();

        const exportBtn = document.getElementById('exportFormData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportFormData());
        }
    }

    setupRealTimeValidation() {
        this.getRequiredFields().forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });

        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('input', () => this.validateEmail(emailField));
        }

        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', () => this.validatePhone(phoneField));
        }
    }

    getRequiredFields() {
        return Array.from(this.form.elements).filter(field =>
            field.hasAttribute('required') &&
            !['hidden', 'submit', 'reset', 'button'].includes(field.type)
        );
    }

    setupCharacterCounter() {
        const messageField = document.getElementById('message');
        const charCount = document.getElementById('charCount');
        if (messageField && charCount) {
            messageField.addEventListener('input', () => {
                const length = messageField.value.length;
                charCount.textContent = length;
                charCount.classList.toggle('danger', length > 1900);
                charCount.classList.toggle('warning', length > 1500 && length <= 1900);
            });
        }
    }

    setupAutoSave() {
        let saveTimeout;
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => this.saveDraft(false), 2000);
            });
        });
    }

    validateForm() {
        let isValid = true;
        this.clearAllErrors();

        this.getRequiredFields().forEach(field => {
            if (!this.validateField(field)) isValid = false;
        });

        const emailField = document.getElementById('email');
        if (emailField && emailField.value && !this.validateEmail(emailField)) isValid = false;

        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value && !this.validatePhone(phoneField)) isValid = false;

        const messageField = document.getElementById('message');
        if (messageField && messageField.value.length < 10) {
            this.showFieldError(messageField, 'Message must be at least 10 characters long.');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        if (field.required && !value) {
            this.showFieldError(field, 'This field is required.');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateEmail(emailField) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            this.showFieldError(emailField, 'Please enter a valid email address.');
            return false;
        }
        this.clearFieldError(emailField);
        return true;
    }

    validatePhone(phoneField) {
        const cleanedPhone = phoneField.value.trim().replace(/[\s()\-]/g, '');
        const phoneRegex = /^[+]?[0-9]{7,15}$/;
        if (!phoneRegex.test(cleanedPhone)) {
            this.showFieldError(phoneField, 'Please enter a valid phone number.');
            return false;
        }
        this.clearFieldError(phoneField);
        return true;
    }

    // Error handling methods (unchanged)...

    async saveDraft(showMessage = true) {
        const formData = this.getFormData();
        const draft = { data: formData, savedAt: new Date().toISOString() };
        this.storageManager.savePreference('contactDraft', draft);
        if (showMessage) this.showStatus('Draft saved successfully!', 'success');
    }

    async loadDraft() {
        const draft = this.storageManager.getPreference('contactDraft');
        if (draft && draft.data && this.isFormEmpty()) {
            if (confirm(`You have a saved draft from ${new Date(draft.savedAt).toLocaleString()}. Load it?`)) {
                await this.populateForm(draft.data);
                this.showStatus('Draft loaded successfully!', 'info');
            }
        }
    }

    clearDraft() {
        this.storageManager.removePreference('contactDraft');
    }

    // ... rest of methods unchanged (populateForm, getFormData, showStatus, exportFormData, etc.)
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
    new FormDataManager(); // optional, for submissions history
});
