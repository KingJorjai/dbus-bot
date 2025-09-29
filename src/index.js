const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
const { ErrorHandler } = require('./utils/errorHandler');
const ResponseHelper = require('./helpers/responseHelper');
const Logger = require('./utils/logger');

/**
 * Discord Bot Client Setup
 */
class DiscordBot {
	constructor() {
		this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
		this.client.commands = new Collection();

		this.loadCommands();
		this.setupEventHandlers();
	}

	/**
	 * Load all commands from the commands directory
	 */
	loadCommands() {
		const foldersPath = path.join(__dirname, 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);

				if ('data' in command && 'execute' in command) {
					this.client.commands.set(command.data.name, command);
					Logger.info(`Loaded command: ${command.data.name}`, 'LOAD');
				}
				else {
					Logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`, 'LOAD');
				}
			}
		}
	}

	/**
	 * Setup event handlers for the Discord client
	 */
	setupEventHandlers() {
		// Ready event
		this.client.once(Events.ClientReady, readyClient => {
			Logger.bot('Bot ready', `Logged in as ${readyClient.user.tag}`);
			Logger.info(`Loaded ${this.client.commands.size} commands`, 'LOAD');
		});

		// Interaction event
		this.client.on(Events.InteractionCreate, async interaction => {
			await this.handleInteraction(interaction);
		});

		// Error handling
		this.client.on('error', error => {
			ErrorHandler.handle(error, 'Discord Client');
		});

		this.client.on('warn', info => {
			Logger.warn(`Discord Client Warning: ${info}`, 'DISC');
		});
	}

	/**
	 * Handle Discord interactions
	 * @param {Interaction} interaction - Discord interaction
	 */
	async handleInteraction(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = this.client.commands.get(interaction.commandName);

		if (!command) {
			Logger.error(`No command matching ${interaction.commandName} was found`, 'CMD');
			return;
		}

		try {
			Logger.command(interaction.commandName, interaction.user.tag);
			await command.execute(interaction);
		}
		catch (error) {
			ErrorHandler.handle(error, `Command: ${interaction.commandName}`);

			try {
				const errorMessage = 'There was an error while executing this command!';
				await ResponseHelper.sendError(interaction, errorMessage);
			}
			catch (responseError) {
				Logger.error(`Failed to send error message: ${responseError.message}`, 'RESP');
			}
		}
	}

	/**
	 * Start the bot
	 */
	async start() {
		try {
			await this.client.login(token);
		}
		catch (error) {
			ErrorHandler.handle(error, 'Bot Login');
			process.exit(1);
		}
	}

	/**
	 * Graceful shutdown
	 */
	async shutdown() {
		Logger.bot('Shutting down bot...');
		await this.client.destroy();
		process.exit(0);
	}
}

// Create and start the bot
const bot = new DiscordBot();

// Handle process termination
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

// Start the bot
bot.start();