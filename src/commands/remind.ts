import debug from 'debug';
import {
	Collection,
	Snowflake,
	User,
} from 'discord.js';
import moment, {Moment} from 'moment-timezone';
import wordsToNumbers from 'words-to-numbers';
import findKey from 'lodash/findKey';
import find from 'lodash/find';
import {client, pgclient} from '../index';

const d = debug('bot.src.commands.remind');
const reminders: Collection<number, NodeJS.Timer> = new Collection<number, NodeJS.Timer>();

enum Magnitude { minute = "minutes", hour = "hours", day = "days", week = "weeks", month = "months", year = "years" }
export interface Reminder {
	userId: Snowflake,
	date: Moment,
	message: string,
}

export class Reminder {
	private static lastId: number = -1;
	id: number;
	userId: Snowflake;
	date: Moment;
	message: string;
	static readonly shortcuts: {regex: RegExp, getDate: () => Moment}[] = [
		{regex: /^tomorrow/i, getDate: () => moment().add(1, 'days')},
		{regex: /^next week/i, getDate: () => moment().add(1, 'weeks')},
	];

	private static getNextId() { return this.lastId++; }

	static load({userId, date, message}: {userId: Snowflake, date: string, message: string}) {
		client.fetchUser(userId).then(user => {
			const reminder = new Reminder();
			reminder.userId = userId;
			reminder.date = moment(date);
			reminder.message = message;

			reminders.set(reminder.id, setTimeout(() => {
				user.send(`Reminder of '${reminder.message}'`);
				d(`Sent reminder to ${user.tag} with message ${reminder.message}`);
				reminders.delete(reminder.id);
			}, reminder.date.utc().diff(moment.utc())));
		});
	}

	static parseTime(quantityInput: string, magnitudeInput: string): Moment {
		// Parse values
		const quantity: number = this.parseQuantity(quantityInput);
		const magnitude: Magnitude = this.parseMagnitude(magnitudeInput);

		// Validate values
		if (!magnitude) {
			d(magnitude);
			throw new Error("Invalid Magnitude.");
		}
		if (isNaN(quantity)) {
			d(quantity);
			throw new Error("Invalid quantity");
		}
		if (quantity > 1000) {
			d(quantity);
			throw new Error("Quantity is too large. Try less than 1000.");
		}

		return moment().add(quantity, magnitude);
	}

	static isShortcut(args: string[]): boolean {
		return Reminder.shortcuts.find(s => s.regex.test(args[0])) !== undefined
			|| Reminder.shortcuts.find(s => s.regex.test(`${args[0]} ${args[1]}`)) !== undefined;
	}

	static getShortcut(args: string[]): Reminder {
		const reminder = new Reminder();
		if (Reminder.shortcuts.find(s => s.regex.test(args[0])) !== null) {
			const shortcut = Reminder.shortcuts.find(s => s.regex.test(args.shift()));
			reminder.date = shortcut ? shortcut.getDate() : moment();
			reminder.message = args.join(' ');
		}
		if (Reminder.shortcuts.find(s => s.regex.test(`${args[0]} ${args[1]}`)) !== null) {
			const shortcut = Reminder.shortcuts.find(s => s.regex.test(`${args.shift()} ${args.shift()}`));
			reminder.date = shortcut ? shortcut.getDate() : moment();
			reminder.message = args.join(' ');
		}
		return reminder;
	}

	static parseQuantity(input: string): number {
		if (/^\d+(\.\d+)?$/.test(input)) {
			return Number(input);
		}
		else {
			return Number(wordsToNumbers(input, {fuzzy: true}));
		}
	}

	static parseMagnitude(input: string): Magnitude | null {
		return findKey({
			[Magnitude.minute]: /min(ute(s)?)?/i,
			[Magnitude.hour]: /hour(s)?|hr(s)?/i,
			[Magnitude.day]: /day(s)?/i,
			[Magnitude.week]: /week(s)?/i,
			[Magnitude.month]: /month(s)?/i,
			[Magnitude.year]: /year(s)?/i,
		}, val => val.test(input)) as Magnitude || null;
	}

	constructor(userId?: Snowflake, args?: string[]) {
		this.id = Reminder.getNextId();
		this.userId = userId;
		if (args) {
			if (Reminder.isShortcut(args)) {
				const shortcut = Reminder.getShortcut(args);
				Object.assign(this, shortcut);
			}
			else {
				this.date = Reminder.parseTime(args.shift(), args.shift());
				this.message = args.join(' ');
			}
		}
	}

	valid(): boolean {
		return this.userId && moment.isMoment(this.date);
	}
}

export function LoadReminders() {
	pgclient.query({
		text: "select userId, date, message from reminders where date > current_timestamp",
	}).then(({rows}) => rows.forEach(Reminder.load)).catch(d);
}

export default function Remind(user: User, args: string[]): void {
	const reminder = new Reminder(user.id, args);

	if (reminder.valid()) {
		pgclient.query({
			text: 'insert into reminders(userId, date, message) values($1, $2, $3)',
			values: [reminder.userId, reminder.date.toISOString(true), reminder.message],
		}).then(() => {
			pgclient.query("select timezone from timezones where userId = $1", [user.id]).then(({rows}) => {
				const timezone: string = rows[0] ? rows[0].timezone : 'utc';
				if (timezone === 'utc') {
					user.send('You have not configured your timezone yet, to do so use the config command like this: `' + process.env.PREFIX + 'config set timezone est.' +
					' This message will be sent for every reminder you request until it is set. For now, all times will be shown in UTC.');
				}
				d(timezone);
				user.send(`${reminder.date.tz(timezone).calendar()} you will be reminded of ${reminder.message || 'nothing'}.`);
				reminders.set(reminder.id, setTimeout(() => {
					user.send(`Reminder of '${reminder.message}'`);
					d(`Sent reminder to ${user.tag} with message ${reminder.message}`);
					reminders.delete(reminder.id);
				}, reminder.date.utc().diff(moment.utc())));
			});
		}).catch(err => {
			user.send("There was an error saving the reminder.");
			d(err);
		});
	}
}
