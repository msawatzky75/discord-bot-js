import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";
import debug from "debug";
import moment from "moment";

const d = debug("bot.util");

async function sendReply(interaction: ChatInputCommandInteraction, message: string | InteractionReplyOptions) {
	if (interaction.replied || interaction.deferred) {
		return interaction.followUp(message);
	} else {
		return interaction.reply(message);
	}
}

function getDaysOfMonth(date: Date) {
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	const items: string[] = [];
	for (let i = 1; i <= lastDay.getDate(); i++) {
		items.push(
			new Date(date.getFullYear(), date.getMonth(), i).toLocaleDateString(undefined, {
				year: "numeric",
				month: "numeric",
				day: "numeric",
			}),
		);
	}
	return items;
}

function daysBetween(min: moment.Moment, max: moment.Moment) {
	const items: moment.Moment[] = [];
	let current = min;
	for (let i = min.clone(); i.isSameOrBefore(max); i = i.add(1, "day")) {
		current = i.clone();
		items.push(current);
	}
	return items;
}

export default {
	sendReply,
	getDaysOfMonth,
	daysBetween,
};
