// scripts/dataHandler.js

class DataHandler {
    static instance = null;
    
    constructor() {
        if (DataHandler.instance) {
            return DataHandler.instance;
        }
        DataHandler.instance = this;
        this.processedData = [];
        this.filteredData = [];
    }
    
    async fetchSensorData() {
        try {
            // ✅ Load static JSON dataset instead of API
            const response = await fetch('./data/sensorReadings.json'); 
            const json = await response.json();

            this.processedData = this.processData(json.sensorReadings);
            this.filteredData = [...this.processedData];
            return this.processedData;
        } catch (error) {
            console.error('DataHandler: Error fetching sensor data:', error);
            // fallback: generate simulated data
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
            temperature: parseFloat(item.temperature),
            ph: parseFloat(item.ph),
            ammonia: parseFloat(item.ammonia),
            dissolved_oxygen: parseFloat(item.dissolved_oxygen),
            timestamp: item.timestamp,
            formattedTime: new Date(item.timestamp).toLocaleTimeString(),
            status: item.status || this.calculateStatus(item)
        }));
    }
    
    generateSimulatedData() {
        // simple simulated fallback
        const locations = ['Main Tank', 'Nursery Pond', 'Grow-out Pond', 'Feeding Area', 'Filtration Unit'];
        const now = new Date();
        return Array.from({ length: 10 }, (_, i) => {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const temperature = this.getRandomValue(20, 30, 1);
            const ph = this.getRandomValue(6.5, 8.5, 1);
            const ammonia = this.getRandomValue(0, 2, 2);
            const dissolved_oxygen = this.getRandomValue(4, 10, 1);
            const timestamp = new Date(now.getTime() - i * 60000).toISOString();
            return {
                id: i + 1,
                sensor_id: `SIM_${i + 1}`,
                location,
                temperature,
                ph,
                ammonia,
                dissolved_oxygen,
                timestamp,
                formattedTime: new Date(timestamp).toLocaleTimeString(),
                status: this.calculateStatus({ temperature, ph, ammonia, dissolved_oxygen })
            };
        });
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
        if (reading.dissolved_oxygen < 5 || reading.temperature > 28 || reading.ammonia > 1.5) {
            return 'warning';
        }
        return 'normal';
    }
    
    getReadings(count = null) {
        let readings = [...this.filteredData];
        if (readings.length === 0) readings = [...this.processedData];
        if (count && count > 0) return readings.slice(0, count);
        return readings;
    }
    
    getCurrentReadings() {
        if (this.processedData.length === 0) this.generateSimulatedData();
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
    
    getAllReadings() {
        if (this.processedData.length === 0) this.generateSimulatedData();
        return this.processedData;
    }
    
    filterData(filterType = 'all', value = null) {
        if (filterType === 'all') {
            this.filteredData = [...this.processedData];
            return this.filteredData;
        }
        this.filteredData = this.processedData.filter(reading => {
            switch (filterType) {
                case 'status':
                    return reading.status === value;
                default:
                    return true;
            }
        });
        return this.filteredData;
    }
    
    async refreshData() {
        return await this.fetchSensorData();
    }
    
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
}

export { DataHandler };
