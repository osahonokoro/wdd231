import { DataHandler } from './dataHandler.js';

class Homepage {
  constructor() {
    this.dataHandler = new DataHandler();
    this.readings = [];
    this.init();
  }

  async init() {
    await this.loadFeaturedReadings();
    this.setupModal();
    this.setupHamburgerMenu();

    // Auto-refresh every 5 seconds to simulate live updates
    setInterval(() => {
      this.displayFeaturedReadings(this.dataHandler.getReadings(6, true));
    }, 5000);
  }

  async loadFeaturedReadings() {
    try {
      this.readings = await this.dataHandler.fetchSensorData();
      this.displayFeaturedReadings(this.dataHandler.getReadings(6, true));
    } catch (error) {
      console.error('Error loading featured readings:', error);
      this.showError('Unable to load sensor data. Please try again later.');
    }
  }

  displayFeaturedReadings(readings) {
    const container = document.getElementById('featuredReadings');
    if (!container) return;

    const html = readings.map(reading => `
            <article class="sensor-reading featured" aria-label="Sensor reading for ${reading.location}">
                <h4>${reading.location}</h4>
                <p><strong>Temp:</strong> <span class="value">${reading.temperature}°C</span></p>
                <p><strong>pH:</strong> <span class="value">${reading.ph}</span></p>
                <p><strong>Oxygen:</strong> <span class="value">${reading.dissolved_oxygen} mg/L</span></p>
                <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status}</span></p>
                <p><strong>Time:</strong> ${reading.formattedTime}</p>
                <button class="details-btn" data-id="${reading.id}" aria-label="View details for ${reading.location}">Details</button>
            </article>
        `).join('');

    container.innerHTML = html;
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
    if (!document.getElementById('detailsModal')) {
      const modal = document.createElement('div');
      modal.id = 'detailsModal';
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'modalBody');

      modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-btn" aria-label="Close details modal">&times;</button>
                    <div id="modalBody"></div>
                </div>
            `;
      document.body.appendChild(modal);
    }

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

  showReadingDetails(readingId) {
    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    const reading = this.readings.find(r => r.id === readingId);

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
                    <p><strong>Time:</strong> ${reading.formattedTime}</p>
                </div>
            `;
      modal.style.display = 'block';
    }
  }

  showError(message) {
    const container = document.getElementById('featuredReadings');
    if (container) {
      container.innerHTML = `
                <div class="error-message" role="alert">
                    <p>${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
    }
  }

  // ✅ New method for hamburger menu  
    setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('main-nav');

    if (hamburger && nav) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        nav.classList.toggle("active");
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Homepage();
});



