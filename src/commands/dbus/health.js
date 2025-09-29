const { SlashCommandBuilder } = require('discord.js');
const { checkApiHealth } = require('../../utils/api-caller');
const EmbedHelper = require('../../helpers/embedHelper');
const ResponseHelper = require('../../helpers/responseHelper');
const { ErrorHandler } = require('../../utils/errorHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('health')
		.setDescription('Check if the DBUS API is running and responsive'),

	async execute(interaction) {
		try {
			await ResponseHelper.safeDefer(interaction, { ephemeral: true });

			const healthStatus = await checkApiHealth();
			const embed = EmbedHelper.createHealthEmbed(healthStatus);

			await ResponseHelper.sendEmbed(interaction, embed, { ephemeral: true });
		}
		catch (error) {
			ErrorHandler.handle(error, 'Health Command');

			const embed = EmbedHelper.createHealthErrorEmbed(error);

			try {
				await ResponseHelper.sendEmbed(interaction, embed, { ephemeral: true });
			}
			catch (responseError) {
				console.error('Failed to send error response:', responseError.message);
			}
		}
	},
};