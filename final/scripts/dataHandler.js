// scripts/dataHandler.js
import { dataFetcher } from './api/data-fetcher.js';

class DataHandler {
    static instance = null;

    constructor() {
        if (DataHandler.instance) {
            return DataHandler.instance;
        }
        DataHandler.instance = this;
        this.rawData = [];
        this.processedData = [];
        this.filteredData = [];
        this.currentFilter = 'all';
    }

    async fetchSensorData(forceRefresh = false) {
        try {
            console.log('Fetching sensor data via DataFetcher...');
            this.rawData = await dataFetcher.fetchSensorData(forceRefresh);
            this.processedData = this.processData(this.rawData);
            this.filteredData = [...this.processedData];
            console.log(`DataHandler: Loaded ${this.processedData.length} readings`);
            return this.processedData;
        } catch (error) {
            console.error('DataHandler: Error fetching sensor data:', error);
            // Generate simulated data as fallback
            this.processedData = this.generateSimulatedData();
            this.filteredData = [...this.processedData];
            return this.processedData;
        }
    }

    processData(rawData) {
        return rawData.map((item, index) => ({
            id: item.id || index + 1,
            sensor_id: item.sensor_id || `SENSOR_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            location: item.location || this.getRandomLocation(),
            temperature: parseFloat(item.temperature) || this.getRandomValue(20, 30, 1),
            ph: parseFloat(item.ph) || this.getRandomValue(6.5, 8.5, 1),
            ammonia: parseFloat(item.ammonia) || this.getRandomValue(0, 2, 2),
            dissolved_oxygen: parseFloat(item.dissolved_oxygen) || this.getRandomValue(4, 10, 1),
            timestamp: item.timestamp || new Date().toISOString(),
            formattedTime: item.formattedTime || new Date(item.timestamp || Date.now()).toLocaleTimeString(),
            status: item.status || this.calculateStatus({
                temperature: parseFloat(item.temperature) || this.getRandomValue(20, 30, 1),
                ph: parseFloat(item.ph) || this.getRandomValue(6.5, 8.5, 1),
                ammonia: parseFloat(item.ammonia) || this.getRandomValue(0, 2, 2),
                dissolved_oxygen: parseFloat(item.dissolved_oxygen) || this.getRandomValue(4, 10, 1)
            })
        }));
    }

    generateSimulatedData() {
        console.log('DataHandler: Generating simulated data');
        return dataFetcher.generateSimulatedSensorData();
    }

    getRandomLocation() {
        const locations = ['Main Tank', 'Nursery Pond', 'Grow-out Pond', 'Feeding Area', 'Filtration Unit'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getRandomValue(min, max, decimals = 1) {
        const factor = Math.pow(10, decimals);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    calculateStatus(reading) {
        return dataFetcher.calculateStatus(reading);
    }

    // Get readings with optional count and shuffle
    getReadings(count = null, shuffle = false) {
        let readings = [...this.filteredData];

        if (readings.length === 0) {
            readings = [...this.processedData];
        }

        if (shuffle) {
            readings = readings.sort(() => Math.random() - 0.5);
        }

        if (count && count > 0) {
            return readings.slice(0, count);
        }

        return readings;
    }

    // Get the most recent reading
    getLatestReading() {
        if (this.processedData.length === 0) {
            this.generateSimulatedData();
        }

        if (this.processedData.length === 0) return null;

        // Return the newest reading
        return this.processedData[0];
    }

    // Get current readings (most recent for each sensor/location)
    getCurrentReadings() {
        if (this.processedData.length === 0) {
            this.generateSimulatedData();
        }

        const latestByLocation = new Map();

        this.processedData.forEach(reading => {
            const location = reading.location || reading.sensor_id;

            if (!latestByLocation.has(location) ||
                new Date(reading.timestamp) > new Date(latestByLocation.get(location).timestamp)) {
                latestByLocation.set(location, reading);
            }
        });

        return Array.from(latestByLocation.values());
    }

    // Get all readings (unfiltered)
    getAllReadings() {
        if (this.processedData.length === 0) {
            this.generateSimulatedData();
        }
        return this.processedData;
    }

    // Process readings for display
    processReadings(simulate = false) {
        if (simulate || this.processedData.length === 0) {
            return this.generateSimulatedData();
        }
        return this.processedData;
    }

    // Filter data by parameter
    filterData(filterType = 'all', value = null) {
        this.currentFilter = filterType;

        if (filterType === 'all') {
            this.filteredData = [...this.processedData];
            return this.filteredData;
        }

        this.filteredData = this.processedData.filter(reading => {
            switch (filterType) {
                case 'temperature':
                    return value === 'high' ? reading.temperature > 28 : reading.temperature < 20;
                case 'ph':
                    return value === 'high' ? reading.ph > 8.5 : reading.ph < 6.5;
                case 'oxygen':
                    return reading.dissolved_oxygen < 5;
                case 'status':
                    return reading.status === value;
                case 'location':
                    return reading.location === value;
                default:
                    return true;
            }
        });

        return this.filteredData;
    }

    // Get filtered readings
    getFilteredReadings() {
        return this.filteredData.length > 0 ? this.filteredData : this.processedData;
    }

    // Force refresh data (ignore cache)
    async refreshData() {
        return await this.fetchSensorData(true);
    }

    // Get stats summary
    getStats() {
        const normal = this.processedData.filter(r => r.status === 'normal').length;
        const warning = this.processedData.filter(r => r.status === 'warning').length;
        const danger = this.processedData.filter(r => r.status === 'danger').length;

        return {
            normal,
            warning,
            danger,
            total: this.processedData.length,
            normalPercentage: this.processedData.length > 0 ?
                Math.round((normal / this.processedData.length) * 100) : 0
        };
    }

    // Get chart data
    getChartData(limit = 10) {
        const readings = this.getReadings(limit);

        return {
            labels: readings.map(r => r.formattedTime),
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: readings.map(r => r.temperature),
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'pH Level',
                    data: readings.map(r => r.ph),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Oxygen (mg/L)',
                    data: readings.map(r => r.dissolved_oxygen),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }
            ]
        };
    }
}

// Export for ES6 modules
export { DataHandler };