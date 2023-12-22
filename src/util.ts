import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";

async function sendReply(
	interaction: ChatInputCommandInteraction,
	message: string | InteractionReplyOptions,
) {
	return interaction.replied ? interaction.editReply(message) : interaction.reply(message);
}

export default {
	sendReply,
};
