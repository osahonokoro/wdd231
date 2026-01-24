// ES Module for data handling
export class DataHandler {
    constructor() {
        this.sensorData = [];
        this.filteredData = [];
    }

    // Fetch data from local JSON file with environment detection
    async fetchSensorData() {
        try {
            console.log('Fetching sensor data...');

            // Detect environment: local vs GitHub Pages
            const basePath = window.location.hostname.includes('github.io')
                ? '/wdd231/final/data/sensor-data.json'
                : './data/sensor-data.json';

            const response = await fetch(basePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.sensorData = data.sensorReadings || [];
            this.filteredData = [...this.sensorData];

            console.log(`Successfully loaded ${this.sensorData.length} sensor readings`);

            // Store in localStorage for persistence
            localStorage.setItem('sensorDataCache', JSON.stringify(data));
            localStorage.setItem('sensorDataTimestamp', new Date().toISOString());

            return this.sensorData;
        } catch (error) {
            console.error('Error fetching sensor data:', error);

            // Attempt to use cached data
            const cached = localStorage.getItem('sensorDataCache');
            if (cached) {
                console.log('Using cached data from localStorage');
                const data = JSON.parse(cached);
                this.sensorData = data.sensorReadings || [];
                this.filteredData = [...this.sensorData];
                return this.sensorData;
            }

            throw new Error('Failed to load sensor data. Please try again later.');
        }
    }

    // Get specific number of readings
    getReadings(count = 15, simulate = false) {
        const data = simulate ? this.processReadings(true) : this.filteredData;
        return data.slice(0, count);
    }

    // Filter data using array methods
    filterData(parameter, value) {
        if (parameter === 'all') {
            this.filteredData = [...this.sensorData];
        } else if (parameter === 'status') {
            this.filteredData = this.sensorData.filter(reading => reading.status === value);
        } else {
            this.filteredData = this.sensorData.filter(reading => reading[parameter] !== undefined);
        }
        return this.filteredData;
    }

    // Calculate averages using array reduce method
    calculateAverages() {
        if (this.sensorData.length === 0) return {};
        const averages = {};
        const parameters = ['temperature', 'ph', 'ammonia', 'dissolved_oxygen'];
        parameters.forEach(param => {
            const sum = this.sensorData.reduce((total, reading) => total + (reading[param] || 0), 0);
            averages[param] = sum / this.sensorData.length;
        });
        return averages;
    }

    // Get latest reading
    getLatestReading(simulate = false) {
        if (this.sensorData.length === 0) return null;
        const latest = this.sensorData[this.sensorData.length - 1]; // FIXED: last element
        return simulate ? { ...latest, timestamp: new Date().toISOString() } : latest;
    }

    // Get readings by status using array filter
    getReadingsByStatus(status) {
        return this.sensorData.filter(reading => reading.status === status);
    }

    // Process data with array map and simulate live timestamps
    processReadings(simulate = false) {
        return this.sensorData.map((reading, index) => {
            const simulatedTime = simulate
                ? new Date(Date.now() - index * 60000).toISOString()
                : reading.timestamp;

            return {
                ...reading,
                temperature: simulate ? (reading.temperature + (Math.random() - 0.5)).toFixed(1) : reading.temperature,
                ph: simulate ? (reading.ph + (Math.random() - 0.05)).toFixed(2) : reading.ph,
                dissolved_oxygen: simulate ? (reading.dissolved_oxygen + (Math.random() - 0.2)).toFixed(2) : reading.dissolved_oxygen,
                formattedTime: new Date(simulatedTime).toLocaleTimeString(),
                statusLabel: reading.status.toUpperCase(),
                isCritical: reading.status === 'danger'
            };
        });
    }
}
