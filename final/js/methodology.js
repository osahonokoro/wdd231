import { DataHandler } from './dataHandler.js';

class Methodology {
    constructor() {
        this.dataHandler = new DataHandler();
        this.init();
    }

    async init() {
        await this.loadHardwareComponents();
        this.setupFormValidation();
    }

    async loadHardwareComponents() {
        const container = document.getElementById('hardwareList');
        if (!container) return;

        const hardwareComponents = [
            {
                name: 'ESP32 Microcontroller',
                purpose: 'Sensor data acquisition and preprocessing',
                specs: 'Dual-core, Wi-Fi/Bluetooth, Modbus TCP/IP',
                category: 'processing',
                url: 'https://www.espressif.com/en/products/socs/esp32',
                datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf'
            },
            {
                name: 'Raspberry Pi 4 (4GB RAM)',
                purpose: 'Central processing and ML model execution',
                specs: 'ARM Cortex-A72, 4GB RAM, Python dashboard',
                category: 'processing',
                url: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
                datasheet: 'https://www.raspberrypi.com/documentation/computers/raspberry-pi.html'
            },
            {
                name: 'DS18B20 Temperature Sensor',
                purpose: 'Real-time water temperature monitoring',
                specs: 'Digital, waterproof, ±0.5°C accuracy',
                category: 'sensors',
                url: 'https://www.analog.com/en/products/ds18b20.html',
                datasheet: 'https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf'
            },
            // ... keep the rest of your components here ...
        ];

        container.innerHTML = '';

        hardwareComponents.forEach(component => {
            const componentElement = this.createComponentCard(component);
            container.appendChild(componentElement);
        });

        this.addFilterControls(container);
    }

    createComponentCard(component) {
        const card = document.createElement('article');
        card.className = `component-card ${component.category}`;
        card.dataset.category = component.category;
        card.setAttribute('aria-label', `${component.name} - ${component.purpose}`);

        card.innerHTML = `
            <div class="component-icon" aria-hidden="true">${this.getComponentIcon(component.category)}</div>
            <div class="component-info">
                <h4>${component.name}</h4>
                <p class="component-purpose">${component.purpose}</p>
                <p class="component-specs"><strong>Specifications:</strong> ${component.specs}</p>
                <div class="component-links">
                    <a href="${component.url}" target="_blank" rel="noopener" class="component-link">🔗 Product Page</a>
                    ${component.datasheet ? `<a href="${component.datasheet}" target="_blank" rel="noopener" class="component-link datasheet">📄 Datasheet</a>` : ''}
                </div>
                <span class="component-category">${this.formatCategory(component.category)}</span>
            </div>
        `;
        return card;
    }

    getComponentIcon(category) {
        const icons = {
            'processing': '⚙️',
            'sensors': '📡',
            'actuation': '🔌',
            'filtration': '💧'
        };
        return icons[category] || '🔧';
    }

    formatCategory(category) {
        const categories = {
            'processing': 'Processing Unit',
            'sensors': 'Sensor Device',
            'actuation': 'Control System',
            'filtration': 'Filtration Media'
        };
        return categories[category] || category;
    }

    addFilterControls(container) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'component-filters';
        filterContainer.innerHTML = `
            <h4>Filter by Category:</h4>
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all" aria-label="Show all components">All Components</button>
                <button class="filter-btn" data-filter="processing" aria-label="Show processing components">Processing</button>
                <button class="filter-btn" data-filter="sensors" aria-label="Show sensor components">Sensors</button>
                <button class="filter-btn" data-filter="actuation" aria-label="Show actuation components">Actuation</button>
                <button class="filter-btn" data-filter="filtration" aria-label="Show filtration components">Filtration</button>
            </div>
        `;

        container.parentNode.insertBefore(filterContainer, container);
        this.setupFiltering();
    }

    setupFiltering() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const componentCards = document.querySelectorAll('.component-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter;

                componentCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    setupFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const errorContainer = document.createElement('div');
        errorContainer.className = 'form-error';
        errorContainer.setAttribute('role', 'alert');

        if (name.length < 2) {
            errorContainer.textContent = 'Please enter a valid name';
            document.getElementById('contactForm').prepend(errorContainer);
            return false;
        }

        if (!this.isValidEmail(email)) {
            errorContainer.textContent = 'Please enter a valid email address';
            document.getElementById('contactForm').prepend(errorContainer);
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Methodology();
});
