// ES Module for data handling
export class DataHandler {
    constructor() {
        this.sensorData = [];
        this.filteredData = [];
    }

    // Fetch data from local JSON file with try-catch
    async fetchSensorData() {
        try {
            console.log('Fetching sensor data...');
            const response = await fetch('./data/sensor-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.sensorData = data.sensorReadings;
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
        } else {
            this.filteredData = this.sensorData.filter(reading => {
                if (parameter === 'status') {
                    return reading.status === value;
                }
                return reading[parameter] !== undefined;
            });
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
        const latest = this.sensorData[0];
        if (simulate) {
            return {
                ...latest,
                timestamp: new Date().toISOString()
            };
        }
        return latest;
    }

    // Get readings by status using array filter
    getReadingsByStatus(status) {
        return this.sensorData.filter(reading => reading.status === status);
    }

    // Process data with array map and simulate live timestamps
    processReadings(simulate = false) {
        return this.sensorData.map((reading, index) => {
            const simulatedTime = simulate
                ? new Date(Date.now() - index * 60000).toISOString() // each reading 1 min apart
                : reading.timestamp;

            return {
                ...reading,
                formattedTime: new Date(simulatedTime).toLocaleTimeString(),
                isCritical: reading.status === 'danger'
            };
        });
    }
}
