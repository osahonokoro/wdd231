// scripts/dashboard.js
import { DataHandler } from './dataHandler.js';

class Dashboard {
  constructor() {
    this.dataHandler = new DataHandler();
    this.readings = [];
    this.init();
  }

  async init() {
    await this.loadDashboardData();

    // ✅ Auto-refresh every 5 seconds
    setInterval(async () => {
      await this.loadDashboardData(true);
    }, 5000);
  }

  async loadDashboardData(forceRefresh = false) {
    try {
      this.readings = await this.dataHandler.fetchSensorData(forceRefresh);
      this.displayCurrentValues(this.dataHandler.getCurrentReadings());
      this.displayReadingsGrid(this.dataHandler.getReadings(12));
      this.displayStatsSummary(this.dataHandler.getStats());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Unable to load sensor data. Please try again later.');
    }
  }

  displayCurrentValues(currentReadings) {
    const container = document.getElementById('currentValues');
    if (!container) return;

    const html = currentReadings.map(reading => `
      <div class="current-value">
        <span class="label">${reading.location}</span>
        <span class="value">${reading.temperature}°C | pH ${reading.ph} | O₂ ${reading.dissolved_oxygen} mg/L</span>
        <span class="status-${reading.status}">${reading.status.toUpperCase()}</span>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  displayReadingsGrid(readings) {
    const container = document.getElementById('readingsGrid');
    if (!container) return;

    const html = readings.map(reading => `
      <article class="sensor-reading" aria-label="Sensor reading for ${reading.location}">
        <h4>${reading.location}</h4>
        <p><strong>Temp:</strong> ${reading.temperature}°C</p>
        <p><strong>pH:</strong> ${reading.ph}</p>
        <p><strong>Ammonia:</strong> ${reading.ammonia} mg/L</p>
        <p><strong>Oxygen:</strong> ${reading.dissolved_oxygen} mg/L</p>
        <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status}</span></p>
        <p><strong>Time:</strong> ${reading.formattedTime}</p>
      </article>
    `).join('');

    container.innerHTML = html;
  }

  displayStatsSummary(stats) {
    const container = document.getElementById('statsSummary');
    if (!container) return;

    container.innerHTML = `
      <div class="status-item normal">Normal: ${stats.normal}</div>
      <div class="status-item warning">Warning: ${stats.warning}</div>
      <div class="status-item danger">Danger: ${stats.danger}</div>
      <div class="status-item total">Total: ${stats.total}</div>
      <div class="status-item percentage">Normal %: ${stats.normalPercentage}%</div>
    `;
  }

  showError(message) {
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div class="error-message" role="alert">
          <p>${message}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
