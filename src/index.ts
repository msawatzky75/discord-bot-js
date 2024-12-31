import debug from "debug";
import {Client, GatewayIntentBits, Partials, Routes} from "discord.js";
import {REST} from "@discordjs/rest";
import commands from "./commands/index.js";
import services from "./services/index.js";
import Config from "./config.js";
import util from "./util.js";

const d = debug("bot.index");

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
	partials: [Partials.Message],
});

client.on("ready", () => {
	d(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("v" + Config.Version);
	client.user.setStatus("online");

	// get list of guilds and register the commands on them
	const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

	if (process.env.AUTO_REGISTER) {
		client.guilds.cache.map((guild) => {
			rest
				.put(Routes.applicationGuildCommands(process.env.CLIENT, guild.id), {
					body: commands.map((c) => c.data.toJSON()),
				})
				.then((data: {name: string}[]) => {
					d(
						`Successfully registered '${data.map((d) => d.name).join(", ")}' to '${guild.name}' (${
							guild.id
						})`,
					);
				}, d);
		});
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);
	try {
		await interaction.deferReply();
		await command.execute(interaction);
	} catch (err) {
		d(err);
		await util.sendReply(interaction, {
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

// run services
client.on("messageCreate", async (message) => {
	await Promise.all(services.map((service) => service?.(message)));
});

client.login(Config.Token);
