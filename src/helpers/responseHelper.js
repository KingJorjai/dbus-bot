const { MessageFlags } = require('discord.js');
const { EPHEMERAL_FLAG } = require('../config/constants');

/**
 * Utility class for handling interaction responses
 */
class ResponseHelper {
	/**
	 * Safely reply to an interaction
	 * @param {CommandInteraction} interaction - Discord interaction
	 * @param {Object} options - Reply options
	 */
	static async safeReply(interaction, options) {
		try {
			if (interaction.deferred) {
				return await interaction.editReply(options);
			}
			else if (interaction.replied) {
				return await interaction.followUp(options);
			}
			else {
				return await interaction.reply(options);
			}
		}
		catch (error) {
			console.error('Failed to send interaction response:', error.message);
			throw error;
		}
	}

	/**
	 * Safely defer an interaction reply
	 * @param {CommandInteraction} interaction - Discord interaction
	 * @param {Object} options - Defer options
	 */
	static async safeDefer(interaction, options = {}) {
		try {
			if (!interaction.replied && !interaction.deferred) {
				const deferOptions = {
					flags: options.ephemeral ? EPHEMERAL_FLAG : undefined,
					...options,
				};
				return await interaction.deferReply(deferOptions);
			}
		}
		catch (error) {
			console.error('Failed to defer interaction:', error.message);
			throw error;
		}
	}

	/**
	 * Send an ephemeral error response
	 * @param {CommandInteraction} interaction - Discord interaction
	 * @param {string} message - Error message
	 */
	static async sendError(interaction, message) {
		const options = {
			content: message,
			flags: MessageFlags.Ephemeral,
		};

		return await this.safeReply(interaction, options);
	}

	/**
	 * Send an ephemeral success response
	 * @param {CommandInteraction} interaction - Discord interaction
	 * @param {string} message - Success message
	 */
	static async sendSuccess(interaction, message) {
		const options = {
			content: message,
			flags: MessageFlags.Ephemeral,
		};

		return await this.safeReply(interaction, options);
	}

	/**
	 * Send an embed response
	 * @param {CommandInteraction} interaction - Discord interaction
	 * @param {EmbedBuilder} embed - Discord embed
	 * @param {Object} options - Additional options
	 */
	static async sendEmbed(interaction, embed, options = {}) {
		const replyOptions = {
			embeds: [embed],
			flags: options.ephemeral ? EPHEMERAL_FLAG : undefined,
			components: options.components || [],
			...options,
		};

		return await this.safeReply(interaction, replyOptions);
	}
}

module.exports = ResponseHelper;