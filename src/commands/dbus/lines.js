const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lines')
		.setDescription('Returns the list of bus lines'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};