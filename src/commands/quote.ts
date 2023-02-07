import debug from "debug";
import {ChatInputCommandInteraction, Collection, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import type {Command} from "./index";

const d = debug("bot.commands.quote");

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

		const limit = 100;

		let messages: Collection<string, Message<true>> = new Collection();
		let fetchedMessageCount = 0;
		let pages = 0;

		do {
			d(`fetching ${limit} new messages...`);
			const newMessages = await quoteChannel.messages.fetch({limit: limit, before: messages.last()?.id});
			fetchedMessageCount = newMessages.size;
			messages = messages.concat(newMessages);
			pages++;
		} while (fetchedMessageCount === limit);

		d(`fetched ${messages.size} messages over ${pages} pages`);

		const randomMessage = messages.random();

		// replace mentions with their names
		const content = randomMessage.content.replace(/<@!?(\d+)>/g, (match) => {
			const id = match.replace(/<@!?/, "").replace(/>/, "");
			const member = randomMessage.mentions.users.get(id);
			return `**${member.username.trim()}**`;
		});

		await interaction.reply(content);
	},
};

export default command;
