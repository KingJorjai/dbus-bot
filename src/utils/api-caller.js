const axios = require('axios');
const { API_BASE_URL, HEALTH_URL } = require('../config/constants');
const { APIError } = require('./errorHandler');
const Logger = require('./logger');

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
		const startTime = Date.now();
		try {
			Logger.debug(`Making API request: ${url}`, 'API');
			const response = await axios.get(url);
			const duration = Date.now() - startTime;

			Logger.api('GET', url, response.status, duration);

			if (response.data.success && response.data.data !== undefined) {
				return response.data.data;
			}

			throw new APIError(`Invalid response format from API during ${operation}`);
		}
		catch (error) {
			const duration = Date.now() - startTime;

			if (error instanceof APIError) {
				Logger.api('GET', url, 'ERROR', duration);
				throw error;
			}

			if (error.response && error.response.data && error.response.data.error) {
				Logger.api('GET', url, error.response.status, duration);
				throw new APIError(
					`${operation} failed: ${error.response.data.error.message}`,
					error.response.status,
					error,
				);
			}

			Logger.api('GET', url, 'ERROR', duration);
			throw new APIError(
				`${operation} failed: ${error.message}`,
				500,
				error,
			);
		}
	}

	/**
	 * Checks the health status of the API.
	 * @returns {Promise<{message: string, timestamp: string}>} Health status
	 */
	static async checkApiHealth() {
		const startTime = Date.now();
		try {
			Logger.debug(`Checking API health: ${HEALTH_URL}/health`, 'API');
			const response = await axios.get(`${HEALTH_URL}/health`);
			const duration = Date.now() - startTime;

			Logger.api('GET', `${HEALTH_URL}/health`, response.status, duration);

			if (response.data.success) {
				return {
					message: response.data.message,
					timestamp: response.data.timestamp,
				};
			}

			throw new APIError('Invalid response format from API');
		}
		catch (error) {
			const duration = Date.now() - startTime;

			if (error instanceof APIError) {
				Logger.api('GET', `${HEALTH_URL}/health`, 'ERROR', duration);
				throw error;
			}

			if (error.response && error.response.data && error.response.data.error) {
				Logger.api('GET', `${HEALTH_URL}/health`, error.response.status, duration);
				throw new APIError(
					`API health check failed: ${error.response.data.error.message}`,
					error.response.status,
					error,
				);
			}

			Logger.api('GET', `${HEALTH_URL}/health`, 'ERROR', duration);
			throw new APIError(
				`API health check failed: ${error.message}`,
				500,
				error,
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
			`fetch bus time at stop ${stopCode} for line ${lineNumber}`,
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