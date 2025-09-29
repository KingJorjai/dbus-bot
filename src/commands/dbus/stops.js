const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLineStops } = require('../../utils/api-caller');
const { STOPS_PER_PAGE, COLORS } = require('../../config/constants');
const ResponseHelper = require('../../helpers/responseHelper');
const PaginationHelper = require('../../helpers/paginationHelper');
const ValidationHelper = require('../../helpers/validationHelper');
const { ErrorHandler, ValidationError } = require('../../utils/errorHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stops')
		.setDescription('Get all stops for a specific bus line')
		.addStringOption(option =>
			option.setName('line')
				.setDescription('Bus line code (e.g., 26, 05, 41)')
				.setRequired(true)),

	async execute(interaction) {
		try {
			await ResponseHelper.safeDefer(interaction, { ephemeral: true });

			const rawLineCode = interaction.options.getString('line');

			// Validate and sanitize input
			const lineResult = ValidationHelper.processLineCode(rawLineCode);

			if (!lineResult.isValid) {
				throw new ValidationError(lineResult.error, 'line');
			}

			const stops = await getLineStops(lineResult.value);

			if (!stops || stops.length === 0) {
				const embed = new EmbedBuilder()
					.setTitle(`🚏 Stops for Line ${lineResult.value}`)
					.setDescription(`No stops found for line ${lineResult.value}.`)
					.setColor(COLORS.WARNING)
					.setTimestamp();

				await ResponseHelper.sendEmbed(interaction, embed, { ephemeral: true });
				return;
			}

			let currentPage = 0;
			const totalPages = Math.ceil(stops.length / STOPS_PER_PAGE);

			const generateEmbed = (page) => {
				const start = page * STOPS_PER_PAGE;
				const end = start + STOPS_PER_PAGE;
				const currentStops = stops.slice(start, end);

				const embed = new EmbedBuilder()
					.setTitle(`🚏 Stops for Line ${lineResult.value}`)
					.setDescription(`Showing stops for bus line ${lineResult.value}`)
					.setColor(COLORS.INFO)
					.setFooter({
						text: `Page ${page + 1} of ${totalPages} | ${stops.length} total stops`,
					})
					.setTimestamp();

				currentStops.forEach(stop => {
					embed.addFields({
						name: `Stop ${stop.code || 'Unknown'}`,
						value: stop.name || 'No name available',
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
			ErrorHandler.handle(error, 'Stops Command');

			const errorMessage = ErrorHandler.getUserMessage(error);

			try {
				await ResponseHelper.sendError(interaction, errorMessage);
			}
			catch (responseError) {
				console.error('Failed to send error response:', responseError.message);
			}
		}
	},
};