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
        this.displayReadings(true);

        // Auto-refresh every 5 seconds
        setInterval(() => {
            this.updateCurrentReadings(true);
            this.displayReadings(true);
            this.updateLastUpdated();
        }, 5000);
    }

    async loadData() {
        try {
            await this.dataHandler.fetchSensorData();
            this.updateCurrentReadings(true);
            this.displayReadings(true);
            this.updateLastUpdated();
        } catch (error) {
            this.showError('Unable to load sensor data: ' + error.message);
        }
    }

    displayReadings(simulate = false) {
        const container = document.getElementById('sensorReadings');
        if (!container) return;

        const readings = this.dataHandler.getReadings(15, simulate);
        container.innerHTML = readings.map(reading => `
      <div class="sensor-reading" data-id="${reading.id}">
        <h4>Reading #${reading.id}</h4>
        <p><strong>Temperature:</strong> <span class="value">${reading.temperature}°C</span></p>
        <p><strong>pH Level:</strong> <span class="value">${reading.ph}</span></p>
        <p><strong>Ammonia:</strong> <span class="value">${reading.ammonia} mg/L</span></p>
        <p><strong>Dissolved Oxygen:</strong> <span class="value">${reading.dissolved_oxygen} mg/L</span></p>
        <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
        <p><strong>Time:</strong> ${reading.formattedTime || new Date(reading.timestamp).toLocaleTimeString()}</p>
        <button class="details-btn" data-id="${reading.id}" aria-label="View details for reading ${reading.id}">View Details</button>
      </div>
    `).join('');

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

    showReadingDetails(readingId) {
        const reading = this.dataHandler.processReadings(true).find(r => r.id === readingId);
        if (!reading) return;

        const modal = document.getElementById('readingModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
      <h3 id="modalTitle">Detailed Sensor Reading #${reading.id}</h3>
      <div class="modal-details">
        <p><strong>Sensor ID:</strong> ${reading.sensor_id}</p>
        <p><strong>Location:</strong> ${reading.location}</p>
        <p><strong>Temperature:</strong> ${reading.temperature}°C</p>
        <p><strong>pH Level:</strong> ${reading.ph}</p>
        <p><strong>Ammonia Concentration:</strong> ${reading.ammonia} mg/L</p>
        <p><strong>Dissolved Oxygen:</strong> ${reading.dissolved_oxygen} mg/L</p>
        <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
        <p><strong>Timestamp:</strong> ${reading.formattedTime}</p>
      </div>
    `;

        modal.style.display = 'block';
        modal.focus();

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.onclick = () => modal.style.display = 'none';

        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }

    updateCurrentReadings(simulate = false) {
        const current = this.dataHandler.getLatestReading(simulate);
        const container = document.getElementById('currentValues');
        if (!current || !container) return;

        container.innerHTML = `
      <div class="current-value"><span class="label">Temperature:</span><span class="value">${current.temperature}°C</span></div>
      <div class="current-value"><span class="label">pH:</span><span class="value">${current.ph}</span></div>
      <div class="current-value"><span class="label">Ammonia:</span><span class="value">${current.ammonia} mg/L</span></div>
      <div class="current-value"><span class="label">Dissolved Oxygen:</span><span class="value">${current.dissolved_oxygen} mg/L</span></div>
      <div class="current-value"><span class="label">Status:</span><span class="value status-${current.status}">${current.status.toUpperCase()}</span></div>
      <div class="current-value"><span class="label">Time:</span><span class="value">${new Date(current.timestamp).toLocaleTimeString()}</span></div>
    `;
    }

    updateLastUpdated() {
        const container = document.getElementById('lastUpdated');
        if (container) container.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadData();
            this.updateLastUpdated();
        });
        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilter();
            this.updateLastUpdated();
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
        this.dataHandler.filterData(filterValue === 'all' ? 'all' : filterValue, filterValue);
        this.displayReadings(true);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
