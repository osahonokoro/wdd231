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
            const response = await fetch('../data/sensor-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.sensorData = data.sensorReadings;
            this.filteredData = [...this.sensorData];

            console.log(`Successfully loaded ${this.sensorData.length} sensor readings`);
            return this.sensorData;

        } catch (error) {
            console.error('Error fetching sensor data:', error);
            throw new Error('Failed to load sensor data. Please try again later.');
        }
    }

    // Get specific number of readings
    getReadings(count = 15) {
        return this.filteredData.slice(0, count);
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
            const sum = this.sensorData.reduce((total, reading) => {
                return total + reading[param];
            }, 0);
            averages[param] = sum / this.sensorData.length;
        });

        return averages;
    }

    // Get latest reading
    getLatestReading() {
        return this.sensorData.length > 0 ? this.sensorData[0] : null;
    }

    // Get readings by status using array filter
    getReadingsByStatus(status) {
        return this.sensorData.filter(reading => reading.status === status);
    }

    // Process data with array map
    processReadings() {
        return this.sensorData.map(reading => ({
            ...reading,
            formattedTime: new Date(reading.timestamp).toLocaleTimeString(),
            isCritical: reading.status === 'danger'
        }));
    }
}