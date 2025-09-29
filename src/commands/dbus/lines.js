const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBusLines } = require('../../utils/api-caller');
const { LINES_PER_PAGE, COLORS } = require('../../config/constants');
const ResponseHelper = require('../../helpers/responseHelper');
const PaginationHelper = require('../../helpers/paginationHelper');
const { ErrorHandler } = require('../../utils/errorHandler');
const Logger = require('../../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lines')
		.setDescription('Returns the list of bus lines'),

	async execute(interaction) {
		try {
			await ResponseHelper.safeDefer(interaction, { ephemeral: true });

			const lines = await getBusLines();

			if (!lines || lines.length === 0) {
				const embed = new EmbedBuilder()
					.setTitle('📋 Bus Lines')
					.setDescription('No bus lines found.')
					.setColor(COLORS.WARNING)
					.setTimestamp();

				await ResponseHelper.sendEmbed(interaction, embed, { ephemeral: true });
				return;
			}

			let currentPage = 0;
			const totalPages = Math.ceil(lines.length / LINES_PER_PAGE);

			const generateEmbed = (page) => {
				const start = page * LINES_PER_PAGE;
				const end = start + LINES_PER_PAGE;
				const currentLines = lines.slice(start, end);

				const embed = new EmbedBuilder()
					.setTitle('📋 Available Bus Lines')
					.setDescription('Here are the available bus lines:')
					.setColor(COLORS.INFO)
					.setFooter({
						text: `Page ${page + 1} of ${totalPages} | ${lines.length} total lines`,
					})
					.setTimestamp();

				currentLines.forEach(line => {
					embed.addFields({
						name: line.code || 'Unknown',
						value: line.name || 'No name available',
						inline: true,
					});
				});

				return embed;
			};

			// Send initial response
			const components = totalPages > 1 ? [PaginationHelper.createPaginationButtons(currentPage, totalPages)] : [];
			await ResponseHelper.sendEmbed(interaction, generateEmbed(currentPage), {
				ephemeral: true,
				components,
			});

			// Set up pagination if needed
			if (totalPages > 1) {
				const message = await interaction.fetchReply();
				const collector = PaginationHelper.createPaginationCollector(message);

				collector.on('collect', async i => {
					currentPage = PaginationHelper.handlePageChange(currentPage, totalPages, i.customId);

					const newEmbed = generateEmbed(currentPage);
					const newComponents = [PaginationHelper.createPaginationButtons(currentPage, totalPages)];

					await i.update({
						embeds: [newEmbed],
						components: newComponents,
					});
				});

				collector.on('end', () => {
					PaginationHelper.removePaginationComponents(message);
				});
			}
		}
		catch (error) {
			ErrorHandler.handle(error, 'Lines Command');

			const errorMessage = ErrorHandler.getUserMessage(error);

			try {
				await ResponseHelper.sendError(interaction, errorMessage);
			}
			catch (responseError) {
				Logger.error(`Failed to send error response: ${responseError.message}`, 'LINES');
			}
		}
	},
};