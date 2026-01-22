// form-action.js - Handles display of submitted contact form data

class FormAction {
    constructor() {
        this.resultsContainer = document.getElementById('formResults');
        this.storageDemo = document.getElementById('storageDemo');
        this.recentSubmissions = document.getElementById('recentSubmissions');
        this.init();
    }

    init() {
        this.updateFooterDates();
        this.displaySubmission();
        this.displayRecentSubmissions();
    }

    updateFooterDates() {
        const yearElement = document.getElementById('current-year');
        const pageLoadedElement = document.getElementById('pageLoaded');
        if (yearElement) yearElement.textContent = new Date().getFullYear();
        if (pageLoadedElement) pageLoadedElement.textContent = new Date().toLocaleString();
    }

    displaySubmission() {
        const params = new URLSearchParams(window.location.search);
        if (!params.toString()) {
            this.resultsContainer.innerHTML = `
        <div class="no-data">
          <p>No form data was found. Please use the <a href="contact.html">contact form</a> to send a message.</p>
          <a href="contact.html" class="cta-button">Go to Contact Form</a>
        </div>
      `;
            return;
        }

        let html = '';
        const fieldOrder = [
            'firstName', 'lastName', 'email', 'phone',
            'organization', 'inquiryType', 'projectScope',
            'budget', 'priority', 'subject', 'message'
        ];

        // Preferred order
        fieldOrder.forEach(field => {
            const value = params.get(field);
            if (value) {
                html += this.formatDetail(field, value);
            }
        });

        // Any other fields
        for (const [key, value] of params) {
            if (!fieldOrder.includes(key)) {
                html += this.formatDetail(key, value);
            }
        }

        this.resultsContainer.innerHTML = html || `
      <div class="no-data">
        <p>No form data was submitted. Please use the <a href="contact.html">contact form</a>.</p>
      </div>
    `;

        // Save submission
        this.saveSubmission(Object.fromEntries(params));
    }

    formatDetail(label, value) {
        return `
      <div class="detail-item">
        <span class="detail-label">${this.formatFieldName(label)}:</span>
        <span class="detail-value">${this.escapeHtml(value)}</span>
      </div>
    `;
    }

    formatFieldName(field) {
        return field.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Ph', 'pH');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveSubmission(formData) {
        try {
            formData.submittedAt = new Date().toISOString();
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            submissions.push(formData);
            localStorage.setItem('formSubmissions', JSON.stringify(submissions.slice(-5)));
        } catch (error) {
            console.error('Error saving submission:', error);
        }
    }

    displayRecentSubmissions() {
        try {
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            if (!submissions.length) return;

            let html = '<ul>';
            submissions.forEach((sub, index) => {
                const date = new Date(sub.submittedAt || Date.now());
                html += `<li>Submission ${index + 1}: ${sub.firstName || 'Anonymous'} ${sub.lastName || ''} - ${date.toLocaleDateString()}</li>`;
            });
            html += '</ul>';

            this.recentSubmissions.innerHTML = html;
            this.storageDemo.style.display = 'block';
        } catch (error) {
            console.error('Error displaying recent submissions:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormAction();
});
