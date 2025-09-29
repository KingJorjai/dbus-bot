const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

/**
 * Utility class for creating pagination components
 */
class PaginationHelper {
	/**
	 * Create pagination buttons
	 * @param {number} currentPage - Current page number (0-indexed)
	 * @param {number} totalPages - Total number of pages
	 * @returns {ActionRowBuilder}
	 */
	static createPaginationButtons(currentPage, totalPages) {
		return new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('previous')
					.setStyle('Primary')
					.setEmoji('⬅️')
					.setDisabled(currentPage === 0),
				new ButtonBuilder()
					.setCustomId('next')
					.setStyle('Primary')
					.setEmoji('➡️')
					.setDisabled(currentPage === totalPages - 1),
			);
	}

	/**
	 * Create a collector for pagination interactions
	 * @param {Message} message - The message to collect interactions from
	 * @param {number} timeout - Timeout in milliseconds
	 * @returns {InteractionCollector}
	 */
	static createPaginationCollector(message, timeout = 60000) {
		const filter = i => i.customId === 'previous' || i.customId === 'next';
		return message.createMessageComponentCollector({
			filter,
			time: timeout,
			resetTimer: true,
		});
	}

	/**
	 * Handle pagination interaction
	 * @param {number} currentPage - Current page number
	 * @param {number} totalPages - Total number of pages
	 * @param {string} interactionId - The interaction custom ID
	 * @returns {number} New page number
	 */
	static handlePageChange(currentPage, totalPages, interactionId) {
		if (interactionId === 'previous') {
			return Math.max(currentPage - 1, 0);
		}
		else if (interactionId === 'next') {
			return Math.min(currentPage + 1, totalPages - 1);
		}
		return currentPage;
	}

	/**
	 * Remove pagination components from a message
	 * @param {Message} message - The message to edit
	 */
	static async removePaginationComponents(message) {
		try {
			if (message.editable) {
				await message.edit({ components: [] });
			}
		}
		catch (error) {
			console.error('Could not remove buttons:', error.message);
		}
	}
}

module.exports = PaginationHelper;