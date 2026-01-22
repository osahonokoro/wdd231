// ES Module for data handling
export class DataHandler {
    constructor() {
        this.sensorData = [];
        this.filteredData = [];
    }

    async fetchSensorData() {
        try {
            console.log('Fetching sensor data...');
            const response = await fetch('./data/sensor-data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            this.sensorData = data.sensorReadings || [];
            this.filteredData = [...this.sensorData];

            console.log(`Successfully loaded ${this.sensorData.length} sensor readings`);

            // Cache in localStorage
            localStorage.setItem('sensorDataCache', JSON.stringify(data));
            localStorage.setItem('sensorDataTimestamp', new Date().toISOString());

            return this.sensorData;
        } catch (error) {
            console.error('Error fetching sensor data:', error);

            // Fallback to cached data
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

    getReadings(count = 15, simulate = false) {
        const data = simulate ? this.processReadings(true) : this.filteredData;
        return data.slice(0, count);
    }

    filterData(parameter, value) {
        if (parameter === 'all') {
            this.filteredData = [...this.sensorData];
        } else if (parameter === 'status') {
            this.filteredData = this.sensorData.filter(r => r.status === value);
        } else {
            this.filteredData = this.sensorData.filter(r => r[parameter] !== undefined);
        }
        return this.filteredData;
    }

    calculateAverages() {
        if (this.sensorData.length === 0) return {};
        const parameters = ['temperature', 'ph', 'ammonia', 'dissolved_oxygen'];
        const averages = {};
        parameters.forEach(param => {
            const sum = this.sensorData.reduce((total, r) => total + (r[param] || 0), 0);
            averages[param] = sum / this.sensorData.length;
        });
        return averages;
    }

    getLatestReading(simulate = false) {
        if (this.sensorData.length === 0) return null;
        const latest = this.sensorData[this.sensorData.length - 1]; // FIXED
        return simulate ? { ...latest, timestamp: new Date().toISOString() } : latest;
    }

    getReadingsByStatus(status) {
        return this.sensorData.filter(r => r.status === status);
    }

    processReadings(simulate = false) {
        return this.sensorData.map((reading, index) => {
            const simulatedTime = simulate
                ? new Date(Date.now() - index * 60000).toISOString()
                : reading.timestamp;
            return {
                ...reading,
                formattedTime: new Date(simulatedTime).toLocaleTimeString(),
                statusLabel: reading.status.toUpperCase(),
                isCritical: reading.status === 'danger'
            };
        });
    }
}
