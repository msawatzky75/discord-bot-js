import debug from 'debug';
import {
	Collection,
	Snowflake,
	User,
} from 'discord.js';
import moment, {Moment} from 'moment';
import wordsToNumbers from 'words-to-numbers';
import findKey from 'lodash/findKey';
import findIndex from 'lodash/findIndex';
import {client, pgclient} from '../index';
import {Subscribable} from '../typings';

const d = debug('bot.src.commands.remind');
enum Magnitude { minute = "minutes", hour = "hours", day = "days", week = "weeks", month = "months", year = "years" }
export interface Reminder {
	snowflake: Snowflake,
	date: Moment,
	message: string
}

export default class Remind extends Subscribable {
	static reminders: Collection<string, {reminder: Reminder, timer: NodeJS.Timer}> = new Collection<string, {reminder: Reminder, timer: NodeJS.Timer}>();

	private static parseTime(quantityInput: string, magnitudeInput: string): Moment {
		// Parse values
		const quantity: number = Number(wordsToNumbers(quantityInput, {fuzzy: true}) || quantityInput);
		const magnitude: Magnitude = this.parseMagnitude(magnitudeInput);

		// Validate values
		if (!magnitude || isNaN(quantity)) {
			throw new Error("Invalid quantity or magnitude");
			d(quantity, magnitude);
		}

		return moment().add(quantity, magnitude);
	}

	private static parseMagnitude(input: string): Magnitude {
		return findKey({
			[Magnitude.minute]: /min(ute(s)?)?/,
			[Magnitude.hour]: /hour(s)?|hr(s)?/,
			[Magnitude.day]: /day(s)?/,
			[Magnitude.week]: /week(s)?/,
			[Magnitude.month]: /month(s)?/,
			[Magnitude.year]: /year(s)?/,
		}, val => val.test(input)) as Magnitude;
	}

	public static addReminder(reminder: Reminder): void {
		Remind.reminders.set(reminder.snowflake + reminder.date.valueOf(), {
			reminder: reminder,
			
			timer: setTimeout(() => {
				client.fetchUser(reminder.snowflake, true).then((user) => {
					user.send(`Reminder of '${reminder.message}'`);
					d(`Sent reminder to ${user.tag} with message ${reminder.message}`);
					Remind.removeReminder(reminder);
				});
			}, moment(reminder.date).diff(moment.utc()))
		});
		d("Added reminder:", moment(reminder.date).local().calendar(), "with message", reminder.message);
	}

	public static removeReminder(reminder: Reminder): void {
		this.reminders.delete(reminder.snowflake + reminder.date.valueOf());
	}

	static subscribe(user: User, args: string[]): void {
		// We need at least 2 arguments.
		if (args.length < 2)
			return;

		const remindDate = Remind.parseTime(args.shift(), args.shift()).utc();

		pgclient.query({
			text: 'insert into reminders(snowflake, date, message) values($1, $2, $3)',
			values: [user.id, remindDate.toISOString(true), args.join(' ') || undefined]
		}).then(() => {
			user.send(`${remindDate.calendar()} you will be reminded of ${args.join(' ') || 'nothing'}`)
			this.addReminder({snowflake: user.id, date: remindDate, message: args.join(' ')})
		}).catch((err) => {
			user.send("There was an error saving the reminder.");
			d(err);
		});

		// d(`${user.tag} subscribed to ${args.join(' ')}`);
	}

	static unSubscribe(user: User): void {

		d(`${user.tag} unsubscribed.`);
	}
}
