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
                image: 'esp32-icon.png',
                category: 'processing',
                url: 'https://www.espressif.com/en/products/socs/esp32',
                datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf'
            },
            {
                name: 'Raspberry Pi 4 (4GB RAM)',
                purpose: 'Central processing and ML model execution',
                specs: 'ARM Cortex-A72, 4GB RAM, Python dashboard',
                image: 'raspberrypi-icon.png',
                category: 'processing',
                url: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
                datasheet: 'https://www.raspberrypi.com/documentation/computers/raspberry-pi.html'
            },
            {
                name: 'DS18B20 Temperature Sensor',
                purpose: 'Real-time water temperature monitoring',
                specs: 'Digital, waterproof, ±0.5°C accuracy',
                image: 'temperature-icon.png',
                category: 'sensors',
                url: 'https://www.analog.com/en/products/ds18b20.html',
                datasheet: 'https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf'
            },
            {
                name: 'DS495 Ammonia Sensor',
                purpose: 'Ammonia concentration detection',
                specs: 'UART protocol, RS-485 compatible',
                image: 'ammonia-icon.png',
                category: 'sensors',
                url: 'https://www.sensorshop.io/ammonia-sensor-ds495',
                datasheet: 'https://www.sensorshop.io/datasheets/DS495-datasheet.pdf'
            },
            {
                name: 'pH Sensor Probe',
                purpose: 'Water acidity/alkalinity measurement',
                specs: 'Analog output, continuous monitoring',
                image: 'ph-icon.png',
                category: 'sensors',
                url: 'https://www.atlas-scientific.com/ph-sensors/',
                datasheet: 'https://www.atlas-scientific.com/files/pH_EZO_Datasheet.pdf'
            },
            {
                name: 'Dissolved Oxygen Sensor',
                purpose: 'Oxygen level monitoring for fish health',
                specs: 'Electrochemical, galvanic membrane',
                image: 'oxygen-icon.png',
                category: 'sensors',
                url: 'https://www.vernier.com/product/dissolved-oxygen-probe/',
                datasheet: 'https://www.vernier.com/files/manuals/do-bta.pdf'
            },
            {
                name: 'Programmable Relay Module',
                purpose: 'Filtration and UV system control',
                specs: '4-channel, GPIO-controlled, 10A/250V',
                image: 'relay-icon.png',
                category: 'actuation',
                url: 'https://www.sparkfun.com/products/15093',
                datasheet: 'https://cdn.sparkfun.com/assets/8/9/8/a/b/522650dfce395f6d2d8b456d.pdf'
            },
            {
                name: 'Centrifugal Water Pump',
                purpose: 'Water circulation through filtration system',
                specs: '0.37 kW, 2200 L/h capacity',
                image: 'pump-icon.png',
                category: 'actuation',
                url: 'https://www.amazon.com/dp/B08CXT6C7Z',
                datasheet: 'https://example.com/pump-datasheet.pdf'
            },
            {
                name: 'UV Sterilization Unit',
                purpose: 'Pathogen and microorganism elimination',
                specs: '40W UV lamp, 99.9% sterilization rate',
                image: 'uv-icon.png',
                category: 'actuation',
                url: 'https://www.aquaultraviolet.com/products/classic-series/',
                datasheet: 'https://www.aquaultraviolet.com/support/installation-manuals/'
            },
            {
                name: 'Filtration Tank Media',
                purpose: 'Multi-stage water purification',
                specs: 'Gravel, charcoal, sand, cotton wool layers',
                image: 'filter-icon.png',
                category: 'filtration',
                url: 'https://www.pentairaes.com/filter-media',
                datasheet: 'https://example.com/filter-media-guide.pdf'
            }
        ];

        // Clear container first
        container.innerHTML = '';

        // Using array forEach method to process each component
        hardwareComponents.forEach(component => {
            const componentElement = this.createComponentCard(component);
            container.appendChild(componentElement);
        });

        // Add filter controls
        this.addFilterControls(container, hardwareComponents);
    }

    createComponentCard(component) {
        const card = document.createElement('div');
        card.className = `component-card ${component.category}`;
        card.innerHTML = `
            <div class="component-icon">${this.getComponentIcon(component.category)}</div>
            <div class="component-info">
                <h4>${component.name}</h4>
                <p class="component-purpose">${component.purpose}</p>
                <p class="component-specs"><strong>Specifications:</strong> ${component.specs}</p>
                <div class="component-links">
                    <a href="${component.url}" target="_blank" rel="noopener" class="component-link">
                        🔗 Product Page
                    </a>
                    ${component.datasheet ? `
                    <a href="${component.datasheet}" target="_blank" rel="noopener" class="component-link datasheet">
                        📄 Datasheet
                    </a>
                    ` : ''}
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

    addFilterControls(container, components) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'component-filters';
        filterContainer.innerHTML = `
            <h4>Filter by Category:</h4>
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">All Components</button>
                <button class="filter-btn" data-filter="processing">Processing</button>
                <button class="filter-btn" data-filter="sensors">Sensors</button>
                <button class="filter-btn" data-filter="actuation">Actuation</button>
                <button class="filter-btn" data-filter="filtration">Filtration</button>
            </div>
        `;

        container.parentNode.insertBefore(filterContainer, container);

        // Add filter functionality
        this.setupFiltering(components);
    }

    setupFiltering(components) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const componentCards = document.querySelectorAll('.component-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter;

                // Filter components using array filter method
                componentCards.forEach(card => {
                    if (filter === 'all' || card.classList.contains(filter)) {
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

        if (name.length < 2) {
            alert('Please enter a valid name');
            return false;
        }

        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize methodology page
document.addEventListener('DOMContentLoaded', () => {
    new Methodology();
});