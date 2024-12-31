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
import Fuse from "fuse.js";
import type {IFuseOptions} from "fuse.js";
import util from "../util.js";

const d = debug("bot.commands.quote");
const messages = new Collection<Snowflake, Collection<string, Message<true>>>();
const lastUpdate = new Collection<Snowflake, Date>();
const cacheLife = 1000 * 60 * 15; // 15 minutes

const fuseOptions: IFuseOptions<Message<true>> = {
	keys: [{name: "content", weight: 1}],
};

const command: Command = {
	data: new SlashCommandBuilder()
		.addStringOption((b) => b.setName("search").setRequired(false).setDescription("Fuzzy search all quotes"))
		.setName("quote")
		.setDescription("Sends a random quote from the quote wall."),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// get a random message from the quote channel and send it to the channel the command was sent in
		const quoteChannel = interaction.guild.channels.cache.find((c) => {
			if (!(c instanceof TextChannel)) return false;
			return c.topic?.includes("#quotes");
		});

		if (!(quoteChannel instanceof TextChannel)) throw new Error("Could not find quote channel");

		let serverMessages = messages.get(quoteChannel.guildId);
		const timeSinceUpdate = new Date().getTime() - (lastUpdate.get(quoteChannel.guildId)?.getTime() ?? 0);
		const search = interaction.options.getString("search");

		if (!serverMessages) {
			d(`No cache for ${quoteChannel.guild.name}, fetching quotes...`);
			await updateMessages(quoteChannel);
			serverMessages = messages.get(quoteChannel.guildId);
		} else if (timeSinceUpdate >= cacheLife) {
			d(`Cache expired for ${quoteChannel.guild.name}, fetching quotes...`);
			await updateMessages(quoteChannel);
			serverMessages = messages.get(quoteChannel.guildId);
		}

		let selectedMessage: Message;
		if (search && serverMessages) {
			if (!interaction.deferred) {
				await interaction.deferReply();
			}
			const fuse = new Fuse(
				serverMessages.map((m) => m),
				fuseOptions,
			);
			const results = fuse.search(search, {limit: 1});
			if (results.length) selectedMessage = getRandom(results).item;
			else {
				d("Failed to find match for quote search");
				await util.sendReply(interaction, "Failed to find a match.");
				return;
			}
		}

		if (!selectedMessage) {
			selectedMessage = messages.get(quoteChannel.guildId).random();
		}

		// replace mentions with their names
		const content = selectedMessage.content.replace(/<@!?(\d+)>/g, (match) => {
			const id = match.replace(/<@!?/, "").replace(/>/, "");
			const member = selectedMessage.mentions.users.get(id);
			return `**${member.username.trim()}**`;
		});

		util.sendReply(interaction, content);
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

function getRandom<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)];
}

export default command;
