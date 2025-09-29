/**
 * Custom error classes for better error handling
 */

class APIError extends Error {
	constructor(message, statusCode = 500, originalError = null) {
		super(message);
		this.name = 'APIError';
		this.statusCode = statusCode;
		this.originalError = originalError;
	}
}

class ValidationError extends Error {
	constructor(message, field = null) {
		super(message);
		this.name = 'ValidationError';
		this.field = field;
	}
}

class InteractionError extends Error {
	constructor(message, interaction = null) {
		super(message);
		this.name = 'InteractionError';
		this.interaction = interaction;
	}
}

/**
 * Central error handler
 */
class ErrorHandler {
	/**
	 * Handle and log errors appropriately
	 * @param {Error} error - The error to handle
	 * @param {string} context - Context where the error occurred
	 */
	static handle(error, context = 'Unknown') {
		console.error(`[${context}] ${error.name}: ${error.message}`);

		if (error.originalError) {
			console.error('Original error:', error.originalError);
		}

		if (error.stack) {
			console.error('Stack trace:', error.stack);
		}
	}

	/**
	 * Create user-friendly error message
	 * @param {Error} error - The error to process
	 * @returns {string} User-friendly error message
	 */
	static getUserMessage(error) {
		if (error instanceof ValidationError) {
			return `Invalid input: ${error.message}`;
		}

		if (error instanceof APIError) {
			return `Service temporarily unavailable: ${error.message}`;
		}

		if (error instanceof InteractionError) {
			return `Command failed: ${error.message}`;
		}

		return 'An unexpected error occurred. Please try again later.';
	}
}

module.exports = {
	APIError,
	ValidationError,
	InteractionError,
	ErrorHandler,
};