const { SlashCommandBuilder } = require('discord.js');
const { getBusLines } = require('../../utils/api-caller');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

const EPHEMERAL_FLAG = 64;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lines')
		.setDescription('Returns the list of bus lines'),
	async execute(interaction) {
		try {
			const lines = await getBusLines();
			const linesPerPage = 9;
			let currentPage = 0;

			const generateEmbed = (page) => {
				const start = page * linesPerPage;
				const end = start + linesPerPage;
				const currentLines = lines.slice(start, end);

				const embed = new EmbedBuilder()
					.setTitle('Available Bus Lines')
					.setDescription('Here are the available bus lines:')
					.setColor('#0099ff');

				currentLines.forEach(line => {
					embed.addFields({
						name: line.code || 'undefined',
						value: line.name || 'undefined',
						inline: true,
					});
				});

				return embed;
			};

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setStyle('Primary')
						.setEmoji('⬅️'),
					new ButtonBuilder()
						.setCustomId('next')
						.setStyle('Primary')
						.setEmoji('➡️'),
				);

			// Using withResponse instead of fetchReply
			await interaction.reply({
				embeds: [generateEmbed(currentPage)],
				components: [row],
				flags: EPHEMERAL_FLAG,
			});
			const message = await interaction.fetchReply();

			const filter = i => i.customId === 'previous' || i.customId === 'next';
			const collector = message.createMessageComponentCollector({ filter, time: 60000, resetTimer: true });

			collector.on('collect', async i => {
				if (i.customId === 'previous') {
					currentPage = Math.max(currentPage - 1, 0);
				}
				else if (i.customId === 'next') {
					currentPage = Math.min(currentPage + 1, Math.floor(lines.length / linesPerPage));
				}
				await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
			});

			collector.on('end', () => {
				try {
					// Wrap in try/catch to handle the ChannelNotCached error
					if (message.editable) {
						message.edit({ components: [] }).catch(e => console.error('Could not remove buttons:', e));
					}
				}
				catch (error) {
					console.error(`Failed to edit message after collector ended: ${error.message}`);
				}
			});
		}
		catch (error) {
			console.error(`Failed to retrieve bus lines: ${error.message} (${error.stack})`);
			await interaction.reply({ content: 'Failed to retrieve bus lines.', flags: EPHEMERAL_FLAG });
		}
	},
};