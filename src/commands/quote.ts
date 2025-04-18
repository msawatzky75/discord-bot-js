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
import {getMessages} from "../helpers/messages.js";

const d = debug("bot.commands.quote");

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

		const search = interaction.options.getString("search");
		const serverMessages = await getMessages(quoteChannel);

		let selectedMessage: Message | null;
		if (search && serverMessages) {
			if (!interaction.deferred) {
				await interaction.deferReply();
				selectedMessage = searchQuotes(search, serverMessages);
			} else {
				d("Failed to find match for quote search");
				await util.sendReply(interaction, "Failed to find a match.");
				return;
			}
		}

		if (!selectedMessage) {
			selectedMessage = serverMessages.random();
		}

		// replace mentions with their names
		const content = formatQuote(selectedMessage);

		util.sendReply(interaction, content);
	},
};

function searchQuotes(search: string, messages: Collection<string, Message>) {
	const fuse = new Fuse(
		messages.map((m) => m),
		fuseOptions,
	);
	const results = fuse.search(search, {limit: 1});
	if (results.length) return getRandom(results).item;

	return null;
}

function formatQuote(message: Message) {
	return message.content.replace(/<@!?(\d+)>/g, (match) => {
		const id = match.replace(/<@!?/, "").replace(/>/, "");
		const member = message.mentions.users.get(id);
		return `**${member.username.trim()}**`;
	});
}

function getRandom<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)];
}

export default command;
