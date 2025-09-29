const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

// Validate required config
if (!clientId) {
	console.error('❌ ERROR: clientId is missing from config.json');
	process.exit(1);
}

if (!token) {
	console.error('❌ ERROR: token is missing from config.json');
	process.exit(1);
}

console.log(`🔧 Using clientId: ${clientId}`);

const commands = [];

// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

console.log(`📁 Found ${commandFolders.length} command folders`);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	console.log(`📂 Processing folder: ${folder} (${commandFiles.length} files)`);

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			console.log(`✓ Added command: ${command.data.name}`);
		}
		else {
			console.log(`⚠️ [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
	try {
		console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
		console.log('🎉 Command deployment completed!');
	}
	catch (error) {
		console.error('❌ Error during command deployment:');
		console.error(error);
		process.exit(1);
	}
})();
