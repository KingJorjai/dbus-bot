const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/constants');

/**
 * Utility class for creating consistent embeds
 */
class EmbedHelper {
	/**
	 * Create a success embed
	 * @param {string} title - Embed title
	 * @param {string} description - Embed description
	 * @param {Object} options - Additional options
	 * @returns {EmbedBuilder}
	 */
	static createSuccessEmbed(title, description, options = {}) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(COLORS.SUCCESS)
			.setTimestamp();

		if (options.fields) {
			embed.addFields(options.fields);
		}

		return embed;
	}

	/**
	 * Create an error embed
	 * @param {string} title - Embed title
	 * @param {string} description - Embed description
	 * @param {Object} options - Additional options
	 * @returns {EmbedBuilder}
	 */
	static createErrorEmbed(title, description, options = {}) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(COLORS.ERROR)
			.setTimestamp();

		if (options.fields) {
			embed.addFields(options.fields);
		}

		return embed;
	}

	/**
	 * Create an info embed
	 * @param {string} title - Embed title
	 * @param {string} description - Embed description
	 * @param {Object} options - Additional options
	 * @returns {EmbedBuilder}
	 */
	static createInfoEmbed(title, description, options = {}) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(COLORS.INFO)
			.setTimestamp();

		if (options.fields) {
			embed.addFields(options.fields);
		}

		return embed;
	}

	/**
	 * Create a warning embed
	 * @param {string} title - Embed title
	 * @param {string} description - Embed description
	 * @param {Object} options - Additional options
	 * @returns {EmbedBuilder}
	 */
	static createWarningEmbed(title, description, options = {}) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(COLORS.WARNING)
			.setTimestamp();

		if (options.fields) {
			embed.addFields(options.fields);
		}

		return embed;
	}

	/**
	 * Create a bus arrival embed with dynamic color based on arrival time
	 * @param {string} lineCode - Bus line code
	 * @param {string} stopCode - Stop code
	 * @param {number} arrivalTime - Arrival time in minutes
	 * @returns {EmbedBuilder}
	 */
	static createArrivalEmbed(lineCode, stopCode, arrivalTime) {
		const embed = new EmbedBuilder()
			.setTitle('🚌 Bus Arrival Time')
			.setDescription(`Line ${lineCode} at Stop ${stopCode}`)
			.setTimestamp();

		if (arrivalTime === 0) {
			embed.addFields({
				name: 'Arrival Time',
				value: '🔥 **Arriving Now!**',
				inline: false,
			});
			embed.setColor(COLORS.WARNING);
		}
		else if (arrivalTime <= 5) {
			embed.addFields({
				name: 'Arrival Time',
				value: `⚡ **${arrivalTime} minute${arrivalTime !== 1 ? 's' : ''}**`,
				inline: false,
			});
			embed.setColor(COLORS.WARNING);
		}
		else if (arrivalTime <= 15) {
			embed.addFields({
				name: 'Arrival Time',
				value: `🚌 **${arrivalTime} minutes**`,
				inline: false,
			});
			embed.setColor(COLORS.SUCCESS);
		}
		else {
			embed.addFields({
				name: 'Arrival Time',
				value: `⏰ **${arrivalTime} minutes**`,
				inline: false,
			});
			embed.setColor(COLORS.INFO);
		}

		return embed;
	}

	/**
	 * Create a health status embed
	 * @param {Object} healthStatus - Health status object
	 * @returns {EmbedBuilder}
	 */
	static createHealthEmbed(healthStatus) {
		return new EmbedBuilder()
			.setTitle('🚌 DBUS API Health Status')
			.setDescription(healthStatus.message)
			.setColor(COLORS.SUCCESS)
			.addFields(
				{
					name: 'Status',
					value: '✅ Healthy',
					inline: true,
				},
				{
					name: 'Timestamp',
					value: new Date(healthStatus.timestamp).toLocaleString(),
					inline: true,
				},
			)
			.setTimestamp();
	}

	/**
	 * Create a health error embed
	 * @param {Error} error - Error object
	 * @returns {EmbedBuilder}
	 */
	static createHealthErrorEmbed(error) {
		return new EmbedBuilder()
			.setTitle('🚌 DBUS API Health Status')
			.setDescription('Failed to connect to the DBUS API')
			.setColor(COLORS.ERROR)
			.addFields(
				{
					name: 'Status',
					value: '❌ Unhealthy',
					inline: true,
				},
				{
					name: 'Error',
					value: error.message || 'Unknown error',
					inline: false,
				},
			)
			.setTimestamp();
	}
}

module.exports = EmbedHelper;