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
	for (let i = 0; current.format("yyyy-MM-DD") !== max.format("yyyy-MM-DD"); i++) {
		current = moment(new Date(min.year(), min.month(), min.date() + i));
		items.push(current);
	}
	return items;
}

function roundDate(date: Date, duration: moment.Duration, roundMethod: (x: number) => number = Math.round) {
	const outputDate = moment(date);
	const years = Math.trunc(duration.asYears());
	const months = Math.trunc(duration.asMonths());
	const days = Math.trunc(duration.asDays());
	const hours = Math.trunc(duration.asHours());

	if (years > 0) {
		// d(`Rounding years. (${duration.humanize()})`);
		const i = years;
		const val = outputDate
			.year(roundMethod(outputDate.year() / i) * i)
			.month(0)
			.date(1)
			.hour(0)
			.minute(0)
			.second(0);
		return val;
	}
	if (months > 0) {
		const i = months;
		return outputDate
			.month(roundMethod(outputDate.month() / i) * i)
			.date(1)
			.hour(0)
			.minute(0)
			.second(0);
	}
	if (days > 0) {
		const i = days;
		return outputDate
			.date(roundMethod(outputDate.day() / i) * i)
			.hour(0)
			.minute(0)
			.second(0);
	}
	if (hours > 0) {
		const i = hours;
		return outputDate
			.hour(roundMethod(outputDate.hour() / i) * i)
			.minute(0)
			.second(0);
	}
	d(`did not round date. (${duration})`);
	return outputDate;
}

export default {
	sendReply,
	getDaysOfMonth,
	daysBetween,
	roundDate,
};
