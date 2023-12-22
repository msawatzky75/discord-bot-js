import debug from "debug";
import {
	ChatInputCommandInteraction,
	Collection,
	Message,
	SlashCommandBuilder,
	Snowflake,
	TextChannel,
} from "discord.js";
import type {Command} from "./index";

const d = debug("bot.commands.quote");
const messages = new Collection<Snowflake, Collection<string, Message<true>>>();
const lastUpdate = new Collection<Snowflake, Date>();
const cacheLife = 1000 * 60 * 15; // 15 minutes

const command: Command = {
	data: new SlashCommandBuilder()
		.setName("quote")
		.setDescription("Sends a random quote from the quote wall."),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// get a random message from the quote channel and send it to the channel the command was sent in
		const quoteChannel = interaction.guild.channels.cache.find((c) => {
			if (!(c instanceof TextChannel)) return false;
			return c.topic?.includes("#quotes");
		});

		if (!(quoteChannel instanceof TextChannel)) throw new Error("Could not find quote channel");

		const serverMessages = messages.get(quoteChannel.guildId);
		const timeSinceUpdate = new Date().getTime() - (lastUpdate.get(quoteChannel.guildId)?.getTime() ?? 0);

		if (!serverMessages) {
			d(`No cache for ${quoteChannel.guild.name}, fetching quotes...`);
			interaction.reply("Fetching quotes. This may take some time...");
			await updateMessages(quoteChannel);
		} else if (timeSinceUpdate >= cacheLife) {
			d(`Cache expired for ${quoteChannel.guild.name}, fetching quotes...`);
			await interaction.reply("Cache expired, refreshing. This may take some time...");
			await updateMessages(quoteChannel);
		}

		const randomMessage = messages.get(quoteChannel.guildId).random();

		// replace mentions with their names
		const content = randomMessage.content.replace(/<@!?(\d+)>/g, (match) => {
			const id = match.replace(/<@!?/, "").replace(/>/, "");
			const member = randomMessage.mentions.users.get(id);
			return `**${member.username.trim()}**`;
		});

		interaction.replied ? await interaction.editReply(content) : await interaction.reply(content);
	},
};

async function updateMessages(quoteChannel: TextChannel) {
	const limit = 100;

	let quoteMessages: Collection<string, Message<true>> = new Collection();
	let fetchedMessageCount = 0;
	let pages = 0;

	do {
		d(`fetching ${limit} new messages...`);
		const newMessages = await quoteChannel.messages.fetch({limit: limit, before: quoteMessages.last()?.id});
		fetchedMessageCount = newMessages.size;
		quoteMessages = quoteMessages.concat(newMessages);
		pages++;
	} while (fetchedMessageCount === limit);

	d(`fetched ${quoteMessages.size} messages over ${pages} pages`);
	messages.set(quoteChannel.guildId, quoteMessages);
	lastUpdate.set(quoteChannel.guildId, new Date());
}

export default command;
