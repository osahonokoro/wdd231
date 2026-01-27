// scripts/api/data-fetcher.js
class DataFetcher {
    static instance = null;
    static BASE_URL = 'http://localhost:3000';
    
    static cache = new Map();
    static CACHE_DURATION = 5000; // 5 seconds

    constructor() {
        if (DataFetcher.instance) {
            return DataFetcher.instance;
        }
        DataFetcher.instance = this;
    }

    async fetchSensorData(forceRefresh = false) {
        const cacheKey = 'sensor_data';
        const now = Date.now();
        
        // Check cache first
        if (!forceRefresh && DataFetcher.cache.has(cacheKey)) {
            const cached = DataFetcher.cache.get(cacheKey);
            if (now - cached.timestamp < DataFetcher.CACHE_DURATION) {
                console.log('Returning cached sensor data');
                return cached.data;
            }
        }

        try {
            console.log('Fetching fresh sensor data from API...');
            const response = await fetch(`${DataFetcher.BASE_URL}/sensor-data`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            DataFetcher.cache.set(cacheKey, {
                data: data,
                timestamp: now
            });
            
            console.log(`Fetched ${data.length} sensor readings`);
            return data;
            
        } catch (error) {
            console.error('API fetch failed, generating simulated data:', error);
            
            // Return simulated data as fallback
            return this.generateSimulatedSensorData();
        }
    }

    generateSimulatedSensorData() {
        console.log('Generating simulated sensor data');
        
        const locations = ['Main Tank', 'Nursery Pond', 'Grow-out Pond', 'Feeding Area', 'Filtration Unit'];
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 50; i++) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
            
            const temperature = this.getRandomValue(20, 30, 1);
            const ph = this.getRandomValue(6.5, 8.5, 1);
            const dissolved_oxygen = this.getRandomValue(4, 10, 1);
            const ammonia = this.getRandomValue(0, 2, 2);
            
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
                status: this.calculateStatus({ temperature, ph, dissolved_oxygen, ammonia })
            });
        }
        
        // Sort by timestamp (newest first)
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return data;
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

    clearCache() {
        DataFetcher.cache.clear();
        console.log('Cache cleared');
    }
}

// Create and export singleton instance
const dataFetcher = new DataFetcher();
export { DataFetcher, dataFetcher };