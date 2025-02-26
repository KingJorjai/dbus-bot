const axios = require('axios');

const API_BASE_URL = 'http://143.47.47.64:25569';

/**
 * Fetches the list of bus lines from the API.
 *
 * @returns {Promise<Array<{code: string, name: string, url: string, internal_id: string}>>} A promise that resolves to an array of bus line objects.
 * @throws {Error} If the request fails, an error is thrown with a message indicating the failure.
 */
async function getBusLines() {
	try {
		const response = await axios.get(`${API_BASE_URL}/lines`);
		return response.data;
	}
	catch (error) {
		throw new Error(`Failed to fetch bus lines: ${error.message}`);
	}
}

async function getLineStops(lineCode) {
	try {
		const response = await axios.get(`${API_BASE_URL}/stops/${lineCode}`);
		return response.data;
	}
	catch (error) {
		throw new Error(`Failed to fetch stops for line ${lineCode}: ${error.message}`);
	}
}

async function getBusTimeAtStop(lineNumber, stopCode) {
	try {
		const response = await axios.get(`${API_BASE_URL}/arrival/${lineNumber}/${stopCode}`);
		return response.data.time;
	}
	catch (error) {
		throw new Error(`Failed to fetch bus time at stop ${stopCode} for line ${lineNumber}: ${error.message}`);
	}
}

module.exports = {
	getBusLines,
	getLineStops,
	getBusTimeAtStop,
};