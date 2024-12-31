import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";

async function sendReply(
	interaction: ChatInputCommandInteraction,
	message: string | InteractionReplyOptions,
) {
	if (interaction.replied || interaction.deferred) {
		return interaction.followUp(message);
	} else {
		return interaction.reply(message);
	}
}

export default {
	sendReply,
};
