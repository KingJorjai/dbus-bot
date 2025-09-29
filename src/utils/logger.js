const winston = require('winston');
const path = require('path');

/**
 * Console format with colors, timestamp and context
 */
const consoleFormat = winston.format.combine(
	winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	winston.format.colorize({
		level: true,
		colors: {
			error: 'red',
			warn: 'yellow',
			info: 'cyan',
			debug: 'green',
			verbose: 'magenta',
		},
	}),
	winston.format.printf(({ level, message, context, timestamp }) => {
		const contextStr = context ? `[${context}] ` : '';
		return `${timestamp} ${level} ${contextStr}${message}`;
	}),
);

/**
 * File format with timestamp and full date
 */
const fileFormat = winston.format.combine(
	winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	winston.format.printf(({ level, message, timestamp, context }) => {
		const contextStr = context ? `[${context}] ` : '';
		return `${timestamp} ${level.toUpperCase()} ${contextStr}${message}`;
	}),
);

/**
 * Create logger instance
 */
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	transports: [
		// Console transport with colors
		new winston.transports.Console({
			format: consoleFormat,
		}),

		// File transport for all logs
		new winston.transports.File({
			filename: path.join(process.cwd(), 'logs', 'app.log'),
			format: fileFormat,
			maxsize: 5242880,
			maxFiles: 3,
		}),
	],
	exitOnError: false,
});

/**
 * Logger wrapper class with additional context support
 */
class Logger {
	/**
	 * Log info message
	 * @param {string} message - Log message
	 * @param {string} context - Context/module name
	 */
	static info(message, context = null) {
		logger.info(message, { context });
	}

	/**
	 * Log warning message
	 * @param {string} message - Log message
	 * @param {string} context - Context/module name
	 */
	static warn(message, context = null) {
		logger.warn(message, { context });
	}

	/**
	 * Log error message
	 * @param {string|Error} error - Error message or Error object
	 * @param {string} context - Context/module name
	 */
	static error(error, context = null) {
		if (error instanceof Error) {
			logger.error(error.message, { context, stack: error.stack });
		}
		else {
			logger.error(error, { context });
		}
	}

	/**
	 * Log debug message
	 * @param {string} message - Log message
	 * @param {string} context - Context/module name
	 */
	static debug(message, context = null) {
		logger.debug(message, { context });
	}

	/**
	 * Log verbose message
	 * @param {string} message - Log message
	 * @param {string} context - Context/module name
	 */
	static verbose(message, context = null) {
		logger.verbose(message, { context });
	}

	/**
	 * Log command execution
	 * @param {string} commandName - Command name
	 * @param {string} username - User who executed the command
	 */
	static command(commandName, username) {
		this.info(`${commandName} by ${username}`, 'CMD');
	}

	/**
	 * Log API calls
	 * @param {string} method - HTTP method
	 * @param {string} url - API endpoint
	 * @param {number} status - Response status code
	 * @param {number} duration - Request duration in ms
	 */
	static api(method, url, status, duration = null) {
		const durationStr = duration ? ` ${duration}ms` : '';
		this.info(`${method} ${url} ${status}${durationStr}`, 'API');
	}

	/**
	 * Log bot lifecycle events
	 * @param {string} event - Event name
	 * @param {string} details - Additional details
	 */
	static bot(event, details = '') {
		this.info(`${event}${details ? ` ${details}` : ''}`, 'BOT');
	}

	/**
	 * Get the underlying winston logger instance
	 * @returns {winston.Logger} Winston logger instance
	 */
	static getWinstonLogger() {
		return logger;
	}
}

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = Logger;