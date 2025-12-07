import { DataHandler } from './dataHandler.js';

class Homepage {
    constructor() {
        this.dataHandler = new DataHandler();
        this.init();
    }

    async init() {
        await this.loadFeaturedReadings();
        this.setupModal();
    }

    async loadFeaturedReadings() {
        try {
            const readings = await this.dataHandler.fetchSensorData();
            this.displayFeaturedReadings(readings.slice(0, 6)); // Show 6 on homepage
        } catch (error) {
            console.error('Error loading featured readings:', error);
            this.showError('Unable to load sensor data. Please try again later.');
        }
    }

    displayFeaturedReadings(readings) {
        const container = document.getElementById('featuredReadings');
        if (!container) return;

        // Using array map method and template literals
        const html = readings.map(reading => `
            <div class="sensor-reading featured">
                <h4>${reading.location}</h4>
                <p><strong>Temp:</strong> <span class="value">${reading.temperature}°C</span></p>
                <p><strong>pH:</strong> <span class="value">${reading.ph}</span></p>
                <p><strong>Oxygen:</strong> <span class="value">${reading.dissolved_oxygen} mg/L</span></p>
                <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status}</span></p>
                <button class="details-btn" data-id="${reading.id}">Details</button>
            </div>
        `).join('');

        container.innerHTML = html;

        // Add event listeners to buttons
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

    setupModal() {
        // Create modal element if it doesn't exist
        if (!document.getElementById('detailsModal')) {
            const modal = document.createElement('div');
            modal.id = 'detailsModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-btn">&times;</button>
                    <div id="modalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Setup modal close functionality
        const modal = document.getElementById('detailsModal');
        const closeBtn = modal.querySelector('.close-btn');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async showReadingDetails(readingId) {
        const modal = document.getElementById('detailsModal');
        const modalBody = document.getElementById('modalBody');

        // Get reading data (you might need to store it locally or fetch again)
        const readings = await this.dataHandler.fetchSensorData();
        const reading = readings.find(r => r.id === readingId);

        if (reading) {
            modalBody.innerHTML = `
                <h3>${reading.location} - Sensor Details</h3>
                <div class="modal-details">
                    <p><strong>Sensor ID:</strong> ${reading.sensor_id}</p>
                    <p><strong>Temperature:</strong> ${reading.temperature}°C</p>
                    <p><strong>pH Level:</strong> ${reading.ph}</p>
                    <p><strong>Ammonia:</strong> ${reading.ammonia} mg/L</p>
                    <p><strong>Dissolved Oxygen:</strong> ${reading.dissolved_oxygen} mg/L</p>
                    <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
                    <p><strong>Time:</strong> ${new Date(reading.timestamp).toLocaleString()}</p>
                </div>
            `;
            modal.style.display = 'block';
        }
    }

    showError(message) {
        const container = document.getElementById('featuredReadings');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Homepage();
});