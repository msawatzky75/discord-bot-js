import debug from 'debug';
import {
	Collection,
	Snowflake,
	User,
} from 'discord.js';
import moment, {Moment} from 'moment';
import wordsToNumbers from 'words-to-numbers';
import findKey from 'lodash/findKey';
import {Subscribable} from '../typings';

const d = debug('bot.src.commands.remind');
enum Magnitude { minute = "minutes", hour = "hours", day = "days", week = "weeks", month = "months", year = "years" }

export default class Remind extends Subscribable {
	private static parseTime(quantityInput: string, magnitudeInput: string): Moment {
		// Parse values
		const quantity: number = Number(wordsToNumbers(quantityInput, {fuzzy: true}) || quantityInput);
		const magnitude: Magnitude = this.parseMagnitude(magnitudeInput);

		// Validate values
		if (!magnitude || isNaN(quantity)) {
			throw new Error("Invalid quantity or magnitude");
		}

		d(quantity, magnitude);
		d(moment().add(quantity, magnitude));
		return moment().add(quantity, magnitude);
	}

	private static parseMagnitude(input: string): Magnitude {
		return findKey({
			[Magnitude.minute]: /minute(s)?/,
			[Magnitude.hour]: /hour(s)?/,
			[Magnitude.day]: /day(s)?/,
			[Magnitude.week]: /week(s)?/,
			[Magnitude.month]: /month(s)?/,
			[Magnitude.year]: /year(s)?/,
		}, val => val.test(input)) as unknown as Magnitude;
	}

	static subscribe(user: User, args: string[]): void {
		// We need at least 2 arguments.
		if (args.length < 2)
			return;

		const remindDate = Remind.parseTime(args.shift(), args.shift());
		user.send(`${remindDate.calendar()} you will be reminded of ${args.join(' ') || 'nothing'}`)
		// d(`${user.tag} subscribed to ${args.join(' ')}`);
	}

	static unSubscribe(user: User): void {

		d(`${user.tag} unsubscribed.`);
	}
}
