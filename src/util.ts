import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";

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

function daysBetween(min: Date, max: Date) {
	const items: Date[] = [];
	let current = min;
	for (
		let i = 0;
		current.toLocaleDateString(undefined, {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		}) !==
		max.toLocaleDateString(undefined, {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
		i++
	) {
		current = new Date(min.getFullYear(), min.getMonth(), min.getDay() + i);
		items.push(current);
	}
	return items;
}

export default {
	sendReply,
	getDaysOfMonth,
	daysBetween,
};
