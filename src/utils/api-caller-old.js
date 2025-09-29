const axios = require('axios');
const { API_BASE_URL, HEALTH_URL } = require('../config/constants');
const { APIError } = require('./errorHandler');

/**
 * API client for DBUS service
 */
class ApiClient {
	/**
	 * Make a request to the API with error handling
	 * @param {string} url - Request URL
	 * @param {string} operation - Operation description for error messages
	 * @returns {Promise<Object>} API response data
	 */
	static async makeRequest(url, operation) {
		try {
			const response = await axios.get(url);

			if (response.data.success && response.data.data !== undefined) {
				return response.data.data;
			}
			
			throw new APIError(`Invalid response format from API during ${operation}`);
		}
		catch (error) {
			if (error instanceof APIError) {
				throw error;
			}

			if (error.response && error.response.data && error.response.data.error) {
				throw new APIError(
					`${operation} failed: ${error.response.data.error.message}`,
					error.response.status,
					error
				);
			}
			
			throw new APIError(
				`${operation} failed: ${error.message}`,
				500,
				error
			);
		}
	}

	/**
	 * Checks the health status of the API.
	 * @returns {Promise<{message: string, timestamp: string}>} Health status
	 */
	static async checkApiHealth() {
		try {
			const response = await axios.get(`${HEALTH_URL}/health`);

			if (response.data.success) {
				return {
					message: response.data.message,
					timestamp: response.data.timestamp,
				};
			}
			
			throw new APIError('Invalid response format from API');
		}
		catch (error) {
			if (error instanceof APIError) {
				throw error;
			}

			if (error.response && error.response.data && error.response.data.error) {
				throw new APIError(
					`API health check failed: ${error.response.data.error.message}`,
					error.response.status,
					error
				);
			}
			
			throw new APIError(
				`API health check failed: ${error.message}`,
				500,
				error
			);
		}
	}

	/**
	 * Fetches the list of bus lines from the API.
	 * @returns {Promise<Array>} Array of bus line objects
	 */
	static async getBusLines() {
		return await this.makeRequest(`${API_BASE_URL}/lines`, 'fetch bus lines');
	}

	/**
	 * Fetches stops for a specific bus line
	 * @param {string} lineCode - Bus line code
	 * @returns {Promise<Array>} Array of stop objects
	 */
	static async getLineStops(lineCode) {
		return await this.makeRequest(`${API_BASE_URL}/lines/${lineCode}`, `fetch stops for line ${lineCode}`);
	}

	/**
	 * Fetches bus arrival time at a specific stop
	 * @param {string} lineNumber - Bus line number
	 * @param {string} stopCode - Stop code
	 * @returns {Promise<number>} Arrival time in minutes
	 */
	static async getBusTimeAtStop(lineNumber, stopCode) {
		const data = await this.makeRequest(
			`${API_BASE_URL}/lines/${lineNumber}/${stopCode}`, 
			`fetch bus time at stop ${stopCode} for line ${lineNumber}`
		);
		
		return data.arrival_time;
	}
}

// Export both the class and individual methods for backward compatibility
module.exports = {
	ApiClient,
	checkApiHealth: ApiClient.checkApiHealth.bind(ApiClient),
	getBusLines: ApiClient.getBusLines.bind(ApiClient),
	getLineStops: ApiClient.getLineStops.bind(ApiClient),
	getBusTimeAtStop: ApiClient.getBusTimeAtStop.bind(ApiClient),
};
		}
		else {
			throw new Error('Invalid response format from API');
		}
	}
	catch (error) {
		if (error.response && error.response.data && error.response.data.error) {
			throw new Error(`Failed to fetch bus lines: ${error.response.data.error.message}`);
		}
		throw new Error(`Failed to fetch bus lines: ${error.message}`);
	}
}

async function getLineStops(lineCode) {
	try {
		const response = await axios.get(`${API_BASE_URL}/lines/${lineCode}`);

		// Check if the response follows the new API structure
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		else {
			throw new Error('Invalid response format from API');
		}
	}
	catch (error) {
		if (error.response && error.response.data && error.response.data.error) {
			throw new Error(`Failed to fetch stops for line ${lineCode}: ${error.response.data.error.message}`);
		}
		throw new Error(`Failed to fetch stops for line ${lineCode}: ${error.message}`);
	}
}

async function getBusTimeAtStop(lineNumber, stopCode) {
	try {
		const response = await axios.get(`${API_BASE_URL}/lines/${lineNumber}/${stopCode}`);

		// Check if the response follows the new API structure
		if (response.data.success && response.data.data) {
			return response.data.data.arrival_time;
		}
		else {
			throw new Error('Invalid response format from API');
		}
	}
	catch (error) {
		if (error.response && error.response.data && error.response.data.error) {
			throw new Error(`Failed to fetch bus time at stop ${stopCode} for line ${lineNumber}: ${error.response.data.error.message}`);
		}
		throw new Error(`Failed to fetch bus time at stop ${stopCode} for line ${lineNumber}: ${error.message}`);
	}
}

module.exports = {
	checkApiHealth,
	getBusLines,
	getLineStops,
	getBusTimeAtStop,
};