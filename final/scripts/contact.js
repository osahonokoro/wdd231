// contact.js - Form validation and handling for contact page

// Inline StorageManager if storage.js doesn't exist
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
        const resetBtn = document.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.clearDraft();
                this.hideStatus();
            });
        }

        // Auto-save on input (with debounce)
        this.setupAutoSave();

        // Export button for demonstration
        const exportBtn = document.getElementById('exportFormData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportFormData();
            });
        }
    }

    setupRealTimeValidation() {
        // Validate on blur for all required fields using filter array method
        const requiredFields = this.getRequiredFields();
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

    // Using filter array method as required
    getRequiredFields() {
        const allFields = Array.from(this.form.elements);
        return allFields.filter(field => field.hasAttribute('required') &&
            field.type !== 'hidden' &&
            field.type !== 'submit' &&
            field.type !== 'reset' &&
            field.type !== 'button');
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
                    charCount.classList.add('danger');
                    charCount.classList.remove('warning');
                } else if (length > 1500) {
                    charCount.classList.add('warning');
                    charCount.classList.remove('danger');
                } else {
                    charCount.classList.remove('warning', 'danger');
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

        // Validate all required fields using filter
        const requiredFields = this.getRequiredFields();
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

    async saveDraft(showMessage = true) {
        try {
            // Simulate async operation for demonstration
            await new Promise(resolve => setTimeout(resolve, 300));

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

    async loadDraft() {
        try {
            const draft = this.storageManager.getPreference('contactDraft');

            if (draft && draft.data) {
                // Using filter to check if we should load the draft
                const hasData = Object.values(draft.data).filter(value =>
                    value && value.toString().trim() !== ''
                ).length > 0;

                if (hasData && this.isFormEmpty()) {
                    // Show a modal-like confirmation
                    const loadDraft = confirm(`You have a saved draft from ${new Date(draft.savedAt).toLocaleString()}. Would you like to load it?`);

                    if (loadDraft) {
                        await this.populateForm(draft.data);
                        this.showStatus('Draft loaded successfully!', 'info');
                    }
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

    async populateForm(data) {
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
        // Using filter to check for non-empty values
        const nonEmptyFields = Object.values(formData).filter(value =>
            value && value.toString().trim() !== ''
        );
        return nonEmptyFields.length === 0;
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
        if (!this.formStatus) return;

        this.formStatus.textContent = message;
        this.formStatus.className = `form-status ${type}`;
        this.formStatus.style.display = 'block';
        this.formStatus.setAttribute('aria-live', 'polite');

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideStatus();
            }, 5000);
        }
    }

    hideStatus() {
        if (this.formStatus) {
            this.formStatus.style.display = 'none';
        }
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
        try {
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
        } catch (error) {
            console.error('Error exporting form data:', error);
            this.showStatus('Error exporting data', 'error');
        }
    }
}

// Form data persistence for demonstration
class FormDataManager {
    constructor() {
        this.storageKey = 'contactFormSubmissions';
    }

    async saveSubmission(formData) {
        try {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 300));

            const submissions = this.getSubmissions();
            submissions.push({
                ...formData,
                submittedAt: new Date().toISOString(),
                id: Date.now()
            });

            // Keep only last 10 submissions using slice
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

    // Using array filter method
    getSubmissionsByType(type) {
        const submissions = this.getSubmissions();
        return submissions.filter(sub => sub.inquiryType === type);
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
        const submissions = formDataManager.formatSubmissions();
        console.log(`Existing submissions: ${submissions.length} found`, submissions);

    } catch (error) {
        console.error('Error initializing contact form:', error);

        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <strong>Error loading contact form:</strong> ${error.message}<br>
            Please refresh the page or contact support if the problem persists.
        `;
        const main = document.querySelector('main');
        if (main) {
            main.prepend(errorDiv);
        }
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
    },

    testValidation: function () {
        // Clear form
        document.getElementById('contactForm').reset();

        // Try to submit empty form
        document.getElementById('contactForm').dispatchEvent(new Event('submit', { cancelable: true }));

        return 'Validation test triggered. Check for error messages.';
    }
};

// Export for ES Modules
export { ContactForm, FormDataManager };