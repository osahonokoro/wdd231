// dataHandler.js - Complete updated version
class DataHandler {
    static instance = null;
    static sharedData = [];
    static lastFetchTime = 0;
    static CACHE_DURATION = 5000; // 5 seconds cache
    static BASE_API_URL = 'http://localhost:3000/sensor-data';

    constructor() {
        if (DataHandler.instance) {
            return DataHandler.instance;
        }
        DataHandler.instance = this;
        this.filteredData = [];
        this.currentFilter = 'all';
    }

    async fetchSensorData() {
        const now = Date.now();

        // Return cached data if still fresh
        if (DataHandler.sharedData.length > 0 &&
            (now - DataHandler.lastFetchTime) < DataHandler.CACHE_DURATION) {
            return DataHandler.sharedData;
        }

        try {
            console.log('Fetching fresh sensor data...');
            const response = await fetch(DataHandler.BASE_API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            DataHandler.sharedData = this.processData(rawData);
            DataHandler.lastFetchTime = now;

            console.log(`Fetched ${DataHandler.sharedData.length} sensor readings`);
            return DataHandler.sharedData;
        } catch (error) {
            console.error('Error fetching sensor data:', error);

            // If we have cached data, return it even if stale
            if (DataHandler.sharedData.length > 0) {
                console.log('Returning cached data due to fetch error');
                return DataHandler.sharedData;
            }

            // If no cached data and fetch failed, return simulated data
            console.log('Generating simulated data');
            return this.generateSimulatedData();
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
            formattedTime: item.formattedTime || new Date().toLocaleTimeString(),
            status: item.status || this.calculateStatus({
                temperature: parseFloat(item.temperature) || this.getRandomValue(20, 30, 1),
                ph: parseFloat(item.ph) || this.getRandomValue(6.5, 8.5, 1),
                dissolved_oxygen: parseFloat(item.dissolved_oxygen) || this.getRandomValue(4, 10, 1)
            })
        }));
    }

    generateSimulatedData() {
        const locations = ['Main Tank', 'Nursery Pond', 'Grow-out Pond', 'Feeding Area', 'Filtration Unit'];
        const data = [];

        // Generate data for each location (last 24 hours)
        for (let i = 0; i < 50; i++) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const temperature = this.getRandomValue(20, 30, 1);
            const ph = this.getRandomValue(6.5, 8.5, 1);
            const ammonia = this.getRandomValue(0, 2, 2);
            const dissolved_oxygen = this.getRandomValue(4, 10, 1);

            // Create timestamp (last 24 hours)
            const timestamp = new Date();
            timestamp.setHours(timestamp.getHours() - Math.random() * 24);

            data.push({
                id: i + 1,
                sensor_id: `SENSOR_${(i % 5 + 1).toString().padStart(3, '0')}`,
                location: location,
                temperature: temperature,
                ph: ph,
                ammonia: ammonia,
                dissolved_oxygen: dissolved_oxygen,
                timestamp: timestamp.toISOString(),
                formattedTime: timestamp.toLocaleTimeString(),
                status: this.calculateStatus({ temperature, ph, dissolved_oxygen })
            });
        }

        // Sort by timestamp (newest first)
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return data;
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
        if (reading.ph < 6.5 || reading.ph > 8.5) {
            return 'danger';
        }
        if (reading.dissolved_oxygen < 5 || reading.temperature > 28) {
            return 'warning';
        }
        return 'normal';
    }

    // Get readings with optional count and shuffle
    getReadings(count = null, shuffle = false) {
        let readings = [...DataHandler.sharedData];

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
        if (DataHandler.sharedData.length === 0) return null;

        // Return the first item (should be newest since we sort by timestamp)
        return DataHandler.sharedData[0];
    }

    // Get current readings (most recent for each sensor/location)
    getCurrentReadings() {
        if (DataHandler.sharedData.length === 0) return [];

        const latestByLocation = new Map();

        DataHandler.sharedData.forEach(reading => {
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
        return DataHandler.sharedData;
    }

    // Process readings for display
    processReadings(simulate = false) {
        if (simulate || DataHandler.sharedData.length === 0) {
            return this.generateSimulatedData();
        }
        return DataHandler.sharedData;
    }

    // Filter data by parameter
    filterData(filterType = 'all', value = null) {
        this.currentFilter = filterType;

        if (filterType === 'all') {
            this.filteredData = [...DataHandler.sharedData];
            return this.filteredData;
        }

        this.filteredData = DataHandler.sharedData.filter(reading => {
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
        return this.filteredData.length > 0 ? this.filteredData : DataHandler.sharedData;
    }

    // Force refresh data (ignore cache)
    async refreshData() {
        DataHandler.lastFetchTime = 0;
        return await this.fetchSensorData();
    }

    // Get stats summary
    getStats() {
        const normal = DataHandler.sharedData.filter(r => r.status === 'normal').length;
        const warning = DataHandler.sharedData.filter(r => r.status === 'warning').length;
        const danger = DataHandler.sharedData.filter(r => r.status === 'danger').length;

        return {
            normal,
            warning,
            danger,
            total: DataHandler.sharedData.length,
            normalPercentage: DataHandler.sharedData.length > 0 ?
                Math.round((normal / DataHandler.sharedData.length) * 100) : 0
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
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataHandler };
}

export { DataHandler };