/**
 * Application constants
 */

module.exports = {
	// Discord message flags
	EPHEMERAL_FLAG: 64,

	// Pagination settings
	STOPS_PER_PAGE: 10,
	LINES_PER_PAGE: 9,

	// Embed colors
	COLORS: {
		SUCCESS: '#00ff00',
		ERROR: '#ff0000',
		WARNING: '#ff6600',
		INFO: '#0099ff',
		PRIMARY: '#7289da',
	},

	// Timing constants (in milliseconds)
	INTERACTION_TIMEOUT: 60000,
	COLLECTOR_TIMEOUT: 60000,

	// API settings
	API_BASE_URL: 'http://localhost:3000/api/v1',
	HEALTH_URL: 'http://localhost:3000',
};