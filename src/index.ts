import debug from "debug";
import {Client, GatewayIntentBits} from "discord.js";
import commands from "./commands/index.js";
import services from "./services/index.js";
import dotenv from "dotenv";

dotenv.config();

const d = debug("bot.index");
const dv = debug("verbose.bot.index");

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});

client.on("ready", () => {
	d(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);
	try {
		await command.execute(interaction);
	} catch (err) {
		d(err);
		await interaction.reply({content: "There was an error while executing this command!", ephemeral: true});
	}
});

// run services
client.on("messageCreate", async (message) => {
	await Promise.all(services.map((service) => service?.(message)));
});

client.login(process.env.TOKEN);
