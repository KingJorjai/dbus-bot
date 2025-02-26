const { SlashCommandBuilder } = require('discord.js');
const { getBusLines } = require('../../utils/api-caller');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lines')
		.setDescription('Returns the list of bus lines'),
	async execute(interaction) {
		try {
			const lines = await getBusLines();
			const linesList = lines.map(line => `- **${line.code}**: ${line.name}`).join('\n');
			await interaction.reply(`Here are the available bus lines:\n${linesList}`);
		}
		catch (error) {
			await interaction.reply(`Failed to retrieve bus lines: ${error.message}`);
		}
	},
};