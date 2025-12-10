// contact.js - Form validation and handling for contact page
import { StorageManager } from './storage.js';

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
        // Form submission
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showError('Please fix the errors in the form before submitting.');
            } else {
                this.showLoading(true);
                this.clearDraft();
                // Allow form to submit normally to form-action.html
            }
        });

        // Save draft button
        if (this.saveDraftBtn) {
            this.saveDraftBtn.addEventListener('click', () => {
                this.saveDraft();
            });
        }

        // Clear form button
        document.querySelector('button[type="reset"]').addEventListener('click', () => {
            this.clearDraft();
            this.hideStatus();
        });

        // Auto-save on input (with debounce)
        this.setupAutoSave();
    }

    setupRealTimeValidation() {
        // Validate on blur for all required fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });

        // Email validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('input', () => {
                this.validateEmail(emailField);
            });
        }

        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', () => {
                this.validatePhone(phoneField);
            });
        }
    }

    setupCharacterCounter() {
        const messageField = document.getElementById('message');
        const charCount = document.getElementById('charCount');

        if (messageField && charCount) {
            messageField.addEventListener('input', () => {
                const length = messageField.value.length;
                charCount.textContent = length;

                // Visual feedback for length limits
                if (length > 1900) {
                    charCount.style.color = 'var(--danger)';
                } else if (length > 1500) {
                    charCount.style.color = 'var(--warning)';
                } else {
                    charCount.style.color = 'var(--deep-blue)';
                }
            });
        }
    }

    setupAutoSave() {
        // Debounce auto-save to avoid excessive storage operations
        let saveTimeout;
        const autoSaveFields = this.form.querySelectorAll('input, select, textarea');

        autoSaveFields.forEach(field => {
            field.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.saveDraft(false); // silent save
                }, 2000);
            });
        });
    }

    validateForm() {
        let isValid = true;

        // Clear previous errors
        this.clearAllErrors();

        // Validate all required fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate email format if provided
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            if (!this.validateEmail(emailField)) {
                isValid = false;
            }
        }

        // Validate phone format if provided
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value) {
            if (!this.validatePhone(phoneField)) {
                isValid = false;
            }
        }

        // Validate message length
        const messageField = document.getElementById('message');
        if (messageField && messageField.value) {
            if (messageField.value.length < 10) {
                this.showFieldError(messageField, 'Message must be at least 10 characters long.');
                isValid = false;
            }
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();

        // Check required fields
        if (field.required && !value) {
            this.showFieldError(field, 'This field is required.');
            return false;
        }

        // Clear error if field is now valid
        this.clearFieldError(field);
        return true;
    }

    validateEmail(emailField) {
        const email = emailField.value.trim();
        if (!email) return true; // Empty email is handled by required validation

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        if (!isValid) {
            this.showFieldError(emailField, 'Please enter a valid email address.');
            return false;
        }

        this.clearFieldError(emailField);
        return true;
    }

    validatePhone(phoneField) {
        const phone = phoneField.value.trim();
        if (!phone) return true; // Empty phone is optional

        // Simple phone validation (allows various formats)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanedPhone = phone.replace(/[\s\(\)\-]/g, '');
        const isValid = phoneRegex.test(cleanedPhone);

        if (!isValid) {
            this.showFieldError(phoneField, 'Please enter a valid phone number.');
            return false;
        }

        this.clearFieldError(phoneField);
        return true;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Add error class to field
        field.classList.add('error');

        // Create error message element
        const errorId = `${field.id}Error`;
        let errorElement = document.getElementById(errorId);

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.id = errorId;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');

        const errorId = `${field.id}Error`;
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearAllErrors() {
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });

        const errorMessages = this.form.querySelectorAll('.field-error');
        errorMessages.forEach(error => {
            error.remove();
        });
    }

    saveDraft(showMessage = true) {
        try {
            const formData = this.getFormData();

            // Store in localStorage with timestamp
            const draft = {
                data: formData,
                savedAt: new Date().toISOString(),
                fieldsFilled: Object.keys(formData).length
            };

            this.storageManager.savePreference('contactDraft', draft);

            if (showMessage) {
                this.showStatus('Draft saved successfully!', 'success');
            }

            console.log('Draft saved:', draft);
            return true;
        } catch (error) {
            console.error('Error saving draft:', error);
            if (showMessage) {
                this.showStatus('Error saving draft. Please try again.', 'error');
            }
            return false;
        }
    }

    loadDraft() {
        try {
            const draft = this.storageManager.getPreference('contactDraft');

            if (draft && draft.data) {
                // Ask user if they want to load draft
                if (this.isFormEmpty() && confirm('You have a saved draft. Would you like to load it?')) {
                    this.populateForm(draft.data);
                    this.showStatus('Draft loaded from ' + new Date(draft.savedAt).toLocaleString(), 'info');
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    clearDraft() {
        this.storageManager.savePreference('contactDraft', null);
        console.log('Draft cleared');
    }

    getFormData() {
        const formData = {};
        const formElements = this.form.elements;

        // Using array forEach method
        Array.from(formElements).forEach(element => {
            if (element.name && !element.disabled) {
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else if (element.type === 'radio') {
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else if (element.type === 'file') {
                    // Skip files for localStorage
                } else {
                    formData[element.name] = element.value;
                }
            }
        });

        return formData;
    }

    populateForm(data) {
        // Using array forEach method to populate form
        Object.keys(data).forEach(key => {
            const element = this.form.elements[key];

            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else if (element.type === 'radio') {
                    const radio = this.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                }
            }
        });

        // Trigger input events to update character counters
        const messageField = document.getElementById('message');
        if (messageField && messageField.value) {
            messageField.dispatchEvent(new Event('input'));
        }
    }

    isFormEmpty() {
        const formData = this.getFormData();
        return Object.keys(formData).length === 0 ||
            Object.values(formData).every(value => !value || value.toString().trim() === '');
    }

    showLoading(show) {
        if (show) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    showStatus(message, type = 'info') {
        this.formStatus.textContent = message;
        this.formStatus.className = `form-status ${type}`;
        this.formStatus.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideStatus();
            }, 5000);
        }
    }

    hideStatus() {
        this.formStatus.style.display = 'none';
    }

    showError(message) {
        this.showStatus(message, 'error');

        // Scroll to first error
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    // Export form data as JSON (for demonstration purposes)
    exportFormData() {
        const formData = this.getFormData();
        const jsonData = JSON.stringify(formData, null, 2);

        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contact-form-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showStatus('Form data exported as JSON', 'success');
    }
}

// Form data persistence for demonstration
class FormDataManager {
    constructor() {
        this.storageKey = 'contactFormSubmissions';
    }

    saveSubmission(formData) {
        try {
            const submissions = this.getSubmissions();
            submissions.push({
                ...formData,
                submittedAt: new Date().toISOString(),
                id: Date.now()
            });

            // Keep only last 10 submissions
            const recentSubmissions = submissions.slice(-10);
            localStorage.setItem(this.storageKey, JSON.stringify(recentSubmissions));

            return true;
        } catch (error) {
            console.error('Error saving submission:', error);
            return false;
        }
    }

    getSubmissions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting submissions:', error);
            return [];
        }
    }

    clearSubmissions() {
        localStorage.removeItem(this.storageKey);
    }

    // Using array map method to format submissions for display
    formatSubmissions() {
        const submissions = this.getSubmissions();
        return submissions.map((sub, index) => {
            return {
                id: sub.id,
                number: index + 1,
                name: `${sub.firstName || ''} ${sub.lastName || ''}`.trim(),
                email: sub.email || 'No email',
                type: sub.inquiryType || 'Unknown',
                date: new Date(sub.submittedAt).toLocaleDateString()
            };
        });
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const contactForm = new ContactForm();
        const formDataManager = new FormDataManager();

        // Store form instance globally for debugging/console access
        window.contactForm = contactForm;
        window.formDataManager = formDataManager;

        console.log('Contact form initialized successfully');

        // Demo: Log existing submissions (remove in production)
        console.log('Existing submissions:', formDataManager.formatSubmissions());

    } catch (error) {
        console.error('Error initializing contact form:', error);
        alert('There was an error initializing the contact form. Please refresh the page.');
    }
});

// Example usage for video demonstration:
// These functions can be called in the console for demonstration purposes
window.demoFormFunctions = {
    fillSampleData: function () {
        const form = document.getElementById('contactForm');
        if (form) {
            form.elements.firstName.value = 'John';
            form.elements.lastName.value = 'Doe';
            form.elements.email.value = 'john.doe@example.com';
            form.elements.phone.value = '+1234567890';
            form.elements.organization.value = 'AquaTech Inc.';
            form.elements.inquiryType.value = 'implementation';
            form.elements.projectScope.value = 'medium';
            form.elements.budget.value = '5k_10k';
            form.elements.priority.value = 'medium';
            form.elements.subject.value = 'Inquiry about Smart Aquaculture System';
            form.elements.message.value = 'I am interested in implementing your smart aquaculture monitoring system for our fish farm. Could you provide more information about customization options and pricing?';
            form.elements.newsletter.checked = true;
            form.elements.terms.checked = true;

            // Trigger input events
            const messageField = document.getElementById('message');
            if (messageField) {
                messageField.dispatchEvent(new Event('input'));
            }

            alert('Sample data filled. Try submitting or saving as draft.');
        }
    },

    showLocalStorage: function () {
        const draft = localStorage.getItem('aquaculture_contactDraft');
        const submissions = localStorage.getItem('contactFormSubmissions');

        console.log('Draft:', draft ? JSON.parse(draft) : 'No draft found');
        console.log('Submissions:', submissions ? JSON.parse(submissions) : 'No submissions found');

        return {
            draft: draft ? JSON.parse(draft) : null,
            submissions: submissions ? JSON.parse(submissions) : []
        };
    },

    clearAllData: function () {
        if (confirm('Clear all form data from localStorage?')) {
            localStorage.removeItem('aquaculture_contactDraft');
            localStorage.removeItem('contactFormSubmissions');
            document.getElementById('contactForm').reset();
            alert('All data cleared!');
        }
    }
};