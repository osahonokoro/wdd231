import { DataHandler } from './dataHandler.js';

class Dashboard {
    constructor() {
        this.dataHandler = new DataHandler();
        this.currentTheme = localStorage.getItem('aquaculture_theme') || 'light';
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.applyTheme();
        this.displayReadings();
    }

    async loadData() {
        try {
            await this.dataHandler.fetchSensorData();
            this.updateCurrentReadings();
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Display 15+ items with 4+ properties each
    displayReadings() {
        const container = document.getElementById('sensorReadings');
        const readings = this.dataHandler.getReadings(15);

        // Using array map method and template literals
        const readingsHTML = readings.map(reading => `
            <div class="sensor-reading" data-id="${reading.id}">
                <h4>Reading #${reading.id}</h4>
                <p><strong>Temperature:</strong> <span class="value">${reading.temperature}°C</span></p>
                <p><strong>pH Level:</strong> <span class="value">${reading.ph}</span></p>
                <p><strong>Ammonia:</strong> <span class="value">${reading.ammonia} mg/L</span></p>
                <p><strong>Dissolved Oxygen:</strong> <span class="value">${reading.dissolved_oxygen} mg/L</span></p>
                <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
                <p><strong>Time:</strong> ${new Date(reading.timestamp).toLocaleTimeString()}</p>
                <button class="details-btn" data-id="${reading.id}">View Details</button>
            </div>
        `).join('');

        container.innerHTML = readingsHTML;

        // Add event listeners to detail buttons
        this.setupDetailButtons();
    }

    setupDetailButtons() {
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const readingId = parseInt(e.target.dataset.id);
                this.showReadingDetails(readingId);
            });
        });
    }

    // Modal dialog implementation
    showReadingDetails(readingId) {
        const reading = this.dataHandler.sensorData.find(r => r.id === readingId);
        const modal = document.getElementById('readingModal');
        const modalBody = document.getElementById('modalBody');

        // Using template literals for dynamic content
        modalBody.innerHTML = `
            <h3>Detailed Sensor Reading #${reading.id}</h3>
            <div class="modal-details">
                <p><strong>Sensor ID:</strong> ${reading.sensor_id}</p>
                <p><strong>Location:</strong> ${reading.location}</p>
                <p><strong>Temperature:</strong> ${reading.temperature}°C</p>
                <p><strong>pH Level:</strong> ${reading.ph}</p>
                <p><strong>Ammonia Concentration:</strong> ${reading.ammonia} mg/L</p>
                <p><strong>Dissolved Oxygen:</strong> ${reading.dissolved_oxygen} mg/L</p>
                <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
                <p><strong>Timestamp:</strong> ${new Date(reading.timestamp).toLocaleString()}</p>
            </div>
        `;

        modal.style.display = 'block';

        // Close modal event
        modal.querySelector('.close-btn').onclick = () => {
            modal.style.display = 'none';
        };

        // Close when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    updateCurrentReadings() {
        const current = this.dataHandler.getLatestReading();
        const container = document.getElementById('currentValues');

        if (current) {
            container.innerHTML = `
                <div class="current-value">
                    <span class="label">Temperature:</span>
                    <span class="value">${current.temperature}°C</span>
                </div>
                <div class="current-value">
                    <span class="label">pH:</span>
                    <span class="value">${current.ph}</span>
                </div>
                <div class="current-value">
                    <span class="label">Ammonia:</span>
                    <span class="value">${current.ammonia} mg/L</span>
                </div>
                <div class="current-value">
                    <span class="label">Dissolved Oxygen:</span>
                    <span class="value">${current.dissolved_oxygen} mg/L</span>
                </div>
                <div class="current-value">
                    <span class="label">Status:</span>
                    <span class="value status-${current.status}">${current.status.toUpperCase()}</span>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Theme toggle with local storage
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Refresh data
        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadData();
        });

        // Filter form
        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilter();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('aquaculture_theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
    }

    applyFilter() {
        const filterValue = document.getElementById('parameterFilter').value;
        this.dataHandler.filterData('status', filterValue);
        this.displayReadings();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});