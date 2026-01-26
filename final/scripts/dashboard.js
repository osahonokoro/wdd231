// scripts/dashboard.js
import { DataHandler } from './dataHandler.js';

class Dashboard {
    constructor() {
        this.dataHandler = new DataHandler();
        this.currentTheme = localStorage.getItem('aquaculture_theme') || 'light';
        this.chart = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.applyTheme();
            this.setupHamburgerMenu();

            // Show loading state
            this.showLoadingState();

            // Initial data load
            await this.loadData();

            // Setup auto-refresh (every 5 seconds)
            this.setupAutoRefresh();

        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            console.log('Loading dashboard data...');

            // Fetch data
            await this.dataHandler.fetchSensorData();

            // Update all dashboard components
            this.updateCurrentReadings();
            this.displayReadings();
            this.updateStats();
            this.updateStatusSummary();
            this.renderChart();
            this.updateLastUpdated();

            // Hide loading state
            this.hideLoadingState();

            console.log('Dashboard data loaded successfully');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Unable to load sensor data. Showing simulated data instead.');

            // Try to show simulated data as fallback
            this.showSimulatedData();
        }
    }

    showLoadingState() {
        const readingsContainer = document.getElementById('sensorReadings');
        const currentValues = document.getElementById('currentValues');

        if (readingsContainer) {
            readingsContainer.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 3rem;">
                    <p>Loading sensor data...</p>
                </div>
            `;
        }

        if (currentValues) {
            currentValues.innerHTML = `
                <div class="loading-message" style="text-align: center;">
                    <p>Loading current values...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        const loadingMessages = document.querySelectorAll('.loading-message');
        loadingMessages.forEach(msg => msg.remove());
    }

    showSimulatedData() {
        console.log('Showing simulated data as fallback');

        this.updateCurrentReadings();
        this.displayReadings();
        this.updateStats();
        this.updateStatusSummary();
        this.renderChart();
        this.updateLastUpdated();

        this.showNotification('Using simulated data. Real-time data unavailable.', 'warning');
    }

    displayReadings() {
        const container = document.getElementById('sensorReadings');
        if (!container) {
            console.error('sensorReadings container not found');
            return;
        }

        try {
            const readings = this.dataHandler.getReadings(15);

            if (readings.length === 0) {
                container.innerHTML = `
                    <div class="no-data">
                        <p>No sensor readings available.</p>
                        <button id="retryLoad" class="control-btn">Retry Loading</button>
                    </div>
                `;

                document.getElementById('retryLoad')?.addEventListener('click', () => {
                    this.loadData();
                });
                return;
            }

            const html = readings.map(reading => `
                <article class="sensor-reading" data-id="${reading.id}" data-status="${reading.status}">
                    <h4>${reading.location}</h4>
                    <div class="reading-details">
                        <p><strong>Sensor ID:</strong> ${reading.sensor_id}</p>
                        <p><strong>Temperature:</strong> <span class="value">${reading.temperature}°C</span></p>
                        <p><strong>pH Level:</strong> <span class="value">${reading.ph}</span></p>
                        <p><strong>Ammonia:</strong> <span class="value">${reading.ammonia} mg/L</span></p>
                        <p><strong>Oxygen:</strong> <span class="value">${reading.dissolved_oxygen} mg/L</span></p>
                        <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
                        <p><strong>Time:</strong> ${reading.formattedTime}</p>
                    </div>
                    <button class="details-btn" data-id="${reading.id}" aria-label="View details for ${reading.location}">
                        View Details
                    </button>
                </article>
            `).join('');

            container.innerHTML = html;
            this.setupDetailButtons();

        } catch (error) {
            console.error('Error displaying readings:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Error displaying sensor readings</p>
                    <button id="retryDisplay" class="control-btn">Try Again</button>
                </div>
            `;

            document.getElementById('retryDisplay')?.addEventListener('click', () => {
                this.displayReadings();
            });
        }
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
        const readings = this.dataHandler.getAllReadings();
        const reading = readings.find(r => r.id === readingId);

        if (!reading) {
            this.showNotification('Reading details not found', 'error');
            return;
        }

        let modal = document.getElementById('readingModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'readingModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-btn" aria-label="Close modal">&times;</button>
                    <div id="modalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.close-btn').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3 id="modalTitle">${reading.location} - Detailed Reading</h3>
            <div class="modal-details">
                <p><strong>Sensor ID:</strong> ${reading.sensor_id}</p>
                <p><strong>Location:</strong> ${reading.location}</p>
                <p><strong>Temperature:</strong> ${reading.temperature}°C</p>
                <p><strong>pH Level:</strong> ${reading.ph}</p>
                <p><strong>Ammonia:</strong> ${reading.ammonia} mg/L</p>
                <p><strong>Dissolved Oxygen:</strong> ${reading.dissolved_oxygen} mg/L</p>
                <p><strong>Status:</strong> <span class="status-${reading.status}">${reading.status.toUpperCase()}</span></p>
                <p><strong>Timestamp:</strong> ${reading.formattedTime}</p>
            </div>
        `;

        modal.style.display = 'block';
    }

    updateCurrentReadings() {
        const container = document.getElementById('currentValues');
        if (!container) return;

        try {
            const currentReadings = this.dataHandler.getCurrentReadings();

            if (currentReadings.length === 0) {
                container.innerHTML = `
                    <div class="no-data">
                        <p>No current readings available.</p>
                    </div>
                `;
                return;
            }

            const readingsToShow = currentReadings.slice(0, 6);

            const html = readingsToShow.map(reading => `
                <div class="current-value">
                    <span class="location">${reading.location}</span>
                    <div class="values">
                        <div class="value-row">
                            <span class="label">Temp:</span>
                            <span class="value">${reading.temperature}°C</span>
                        </div>
                        <div class="value-row">
                            <span class="label">pH:</span>
                            <span class="value">${reading.ph}</span>
                        </div>
                        <div class="value-row">
                            <span class="label">O₂:</span>
                            <span class="value">${reading.dissolved_oxygen} mg/L</span>
                        </div>
                        <div class="status-indicator status-${reading.status}">
                            ${reading.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = html;

        } catch (error) {
            console.error('Error updating current readings:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Unable to update current values.</p>
                </div>
            `;
        }
    }

    updateStats() {
        try {
            const stats = this.dataHandler.getStats();

            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

            updateElement('normalCount', stats.normal);
            updateElement('warningCount', stats.warning);
            updateElement('dangerCount', stats.danger);
            updateElement('totalReadings', stats.total);

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    updateStatusSummary() {
        const container = document.getElementById('statusSummary');
        if (!container) return;

        try {
            const stats = this.dataHandler.getStats();

            const html = `
                <div class="status-item normal">
                    <span class="status-dot"></span>
                    <span>Normal: ${stats.normal}</span>
                </div>
                <div class="status-item warning">
                    <span class="status-dot"></span>
                    <span>Warning: ${stats.warning}</span>
                </div>
                <div class="status-item danger">
                    <span class="status-dot"></span>
                    <span>Danger: ${stats.danger}</span>
                </div>
            `;

            container.innerHTML = html;

        } catch (error) {
            console.error('Error updating status summary:', error);
        }
    }

    updateLastUpdated() {
        const container = document.getElementById('lastUpdated');
        if (container) {
            container.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
        }
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadData();
                this.showNotification('Refreshing data...', 'info');
            });
        }

        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilter();
            });
        }

        const paramFilter = document.getElementById('parameterFilter');
        if (paramFilter) {
            paramFilter.addEventListener('change', () => this.applyFilter());
        }
    }

    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5000);
    }

    async refreshData() {
        try {
            console.log('Auto-refreshing dashboard data...');

            await this.dataHandler.refreshData();

            this.updateCurrentReadings();
            this.displayReadings();
            this.updateStats();
            this.updateStatusSummary();
            this.renderChart();
            this.updateLastUpdated();

        } catch (error) {
            console.error('Error during auto-refresh:', error);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('aquaculture_theme', this.currentTheme);
        this.applyTheme();
        this.showNotification(`Theme changed to ${this.currentTheme}`, 'info');
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
    }

    applyFilter() {
        try {
            const filterValue = document.getElementById('parameterFilter')?.value || 'all';
            this.dataHandler.filterData(filterValue === 'all' ? 'all' : 'temperature', filterValue);
            this.displayReadings();
            this.renderChart();
            this.showNotification(`Filter applied: ${filterValue}`, 'info');
        } catch (error) {
            console.error('Error applying filter:', error);
            this.showNotification('Error applying filter', 'error');
        }
    }

    renderChart() {
        const ctx = document.getElementById('sensorChart');
        if (!ctx) return;

        try {
            const chartData = this.dataHandler.getChartData(10);

            if (this.chart) {
                this.chart.destroy();
            }

            this.chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--dark-gray'),
                                font: {
                                    family: "'Roboto', sans-serif"
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Sensor Trends (Last 10 Readings)',
                            color: getComputedStyle(document.body).getPropertyValue('--deep-blue'),
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>${message}</p>
            <button onclick="this.parentElement.remove()" class="control-btn">Dismiss</button>
        `;

        const main = document.querySelector('main');
        if (main) {
            main.prepend(errorDiv);
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 10000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const nav = document.getElementById('main-nav');

        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                nav.classList.toggle('active');
            });
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();

    window.dashboard = dashboard;

    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
    });
});