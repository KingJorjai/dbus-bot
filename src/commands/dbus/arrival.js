const { SlashCommandBuilder } = require('discord.js');
const { getBusTimeAtStop } = require('../../utils/api-caller');
const EmbedHelper = require('../../helpers/embedHelper');
const ResponseHelper = require('../../helpers/responseHelper');
const ValidationHelper = require('../../helpers/validationHelper');
const { ErrorHandler, ValidationError } = require('../../utils/errorHandler');
const Logger = require('../../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arrival')
		.setDescription('Get bus arrival time for a specific line at a specific stop')
		.addStringOption(option =>
			option.setName('line')
				.setDescription('Bus line code (e.g., 26, 05, 41)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('stop')
				.setDescription('Stop code (e.g., 79)')
				.setRequired(true)),

	async execute(interaction) {
		try {
			await ResponseHelper.safeDefer(interaction, { ephemeral: true });

			const rawLineCode = interaction.options.getString('line');
			const rawStopCode = interaction.options.getString('stop');

			// Validate and sanitize inputs
			const lineResult = ValidationHelper.processLineCode(rawLineCode);
			const stopResult = ValidationHelper.processStopCode(rawStopCode);

			if (!lineResult.isValid) {
				throw new ValidationError(lineResult.error, 'line');
			}

			if (!stopResult.isValid) {
				throw new ValidationError(stopResult.error, 'stop');
			}

			// Fetch arrival time
			const arrivalTime = await getBusTimeAtStop(lineResult.value, stopResult.value);

			// Create and send response embed
			const embed = EmbedHelper.createArrivalEmbed(
				lineResult.value,
				stopResult.value,
				arrivalTime,
			);

			await ResponseHelper.sendEmbed(interaction, embed, { ephemeral: true });
		}
		catch (error) {
			ErrorHandler.handle(error, 'Arrival Command');

			const errorMessage = ErrorHandler.getUserMessage(error);

			try {
				await ResponseHelper.sendError(interaction, errorMessage);
			}
			catch (responseError) {
				Logger.error(`Failed to send error response: ${responseError.message}`, 'ARRIVAL');
			}
		}
	},
};