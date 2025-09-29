/**
 * Input validation utilities
 */

class ValidationHelper {
	/**
	 * Validate bus line code format
	 * @param {string} lineCode - Line code to validate
	 * @returns {boolean} Whether the line code is valid
	 */
	static validateLineCode(lineCode) {
		if (!lineCode || typeof lineCode !== 'string') {
			return false;
		}

		// Line codes should be 1-3 characters, alphanumeric
		const lineCodeRegex = /^[A-Za-z0-9]{1,3}$/;
		return lineCodeRegex.test(lineCode.trim());
	}

	/**
	 * Validate stop code format
	 * @param {string} stopCode - Stop code to validate
	 * @returns {boolean} Whether the stop code is valid
	 */
	static validateStopCode(stopCode) {
		if (!stopCode || typeof stopCode !== 'string') {
			return false;
		}

		// Stop codes should be 1-4 digits
		const stopCodeRegex = /^[0-9]{1,4}$/;
		return stopCodeRegex.test(stopCode.trim());
	}

	/**
	 * Sanitize line code input
	 * @param {string} lineCode - Raw line code input
	 * @returns {string} Sanitized line code
	 */
	static sanitizeLineCode(lineCode) {
		if (!lineCode) return '';
		return lineCode.toString().trim().toUpperCase();
	}

	/**
	 * Sanitize stop code input
	 * @param {string} stopCode - Raw stop code input
	 * @returns {string} Sanitized stop code
	 */
	static sanitizeStopCode(stopCode) {
		if (!stopCode) return '';
		return stopCode.toString().trim();
	}

	/**
	 * Validate and sanitize line code
	 * @param {string} lineCode - Raw line code input
	 * @returns {Object} Validation result with sanitized value
	 */
	static processLineCode(lineCode) {
		const sanitized = this.sanitizeLineCode(lineCode);
		const isValid = this.validateLineCode(sanitized);

		return {
			value: sanitized,
			isValid,
			error: isValid ? null : 'Line code must be 1-3 alphanumeric characters',
		};
	}

	/**
	 * Validate and sanitize stop code
	 * @param {string} stopCode - Raw stop code input
	 * @returns {Object} Validation result with sanitized value
	 */
	static processStopCode(stopCode) {
		const sanitized = this.sanitizeStopCode(stopCode);
		const isValid = this.validateStopCode(sanitized);

		return {
			value: sanitized,
			isValid,
			error: isValid ? null : 'Stop code must be 1-4 digits',
		};
	}
}

module.exports = ValidationHelper;