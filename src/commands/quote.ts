import debug from "debug";
import {ChatInputCommandInteraction, SlashCommandBuilder, TextChannel} from "discord.js";
import type {Command} from "./index";

const d = debug("bot.commands.quote");

const command: Command = {
	data: new SlashCommandBuilder()
		.setName("quote")
		.setDescription("Sends a random quote from the quote wall."),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// get a random message from the quote channel and send it to the channel the command was sent in
		const quoteChannel = interaction.guild.channels.cache.get(process.env.QUOTE_CHANNEL);

		if (!(quoteChannel instanceof TextChannel)) throw new Error("Could not find quote channel");

		const messages = await quoteChannel.messages.fetch({limit: 100});
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
