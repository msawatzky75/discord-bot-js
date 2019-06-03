import debug from 'debug';
import {ISubscribable} from '../types';
import {
	Collection,
	Snowflake,
	User,
} from 'discord.js';
import wordsToNumbers
	from 'words-to-numbers';

const d = debug('bot.src.commands.remind');

enum Times {
	minute,
	minutes,
	hour,
	hours,
	day,
	days,
	week,
	weeks,
	month,
	months,
	year,
	years,
}

export default class Remind implements ISubscribable {
	private static parseTime(input: string[]): Date {
		d(input);
		const quantity = wordsToNumbers(input[0], {fuzzy: true});
		const magnitude = Times[input[1]];
		if (Object.keys(Times).indexOf(input[1].toLowerCase()) === -1 || isNaN(Number(wordsToNumbers(input[0], {fuzzy: true})))) {
			throw new Error("Invalid quantity or magnitude");
		}

		d('quantity', quantity);
		d('magnitude', magnitude);

		return new Date();
	}

	subscribe(user: User, args): void {
		let waitTime: number = new Date(0, 0, 0, 1).getTime(); // 1 Hour
		d(Remind.parseTime(args));
		// d(`${user.tag} subscribed to ${args.join(' ')}`);
	}

	unSubscribe(user: User): void {

		d(`${user.tag} unsubscribed.`);
	}
}
