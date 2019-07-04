import debug from 'debug';
import {
	Collection,
	Message,
	RichEmbed,
	Snowflake,
	User,
} from 'discord.js';
import moment, {Moment} from 'moment-timezone';
import wordsToNumbers from 'words-to-numbers';
import findKey from 'lodash/findKey';
import drop from 'lodash/drop';
import {client, pgclient} from '../index';
import {getUserConfig} from './config';

require('dotenv').config();
const d = debug('bot.src.commands.remind');
const reminders: Collection<number, NodeJS.Timer> = new Collection<number, NodeJS.Timer>();

function addReminder(reminder: Reminder, user: User) {
	reminders.set(reminder.id, setTimeout(() => {
		user.send(`Reminder of '${reminder.message}'`);
		d(`Sent reminder to ${user.tag} with message ${reminder.message}`);
		reminders.delete(reminder.id);
	}, reminder.date.utc().diff(moment.utc())));
	d('reminder set', reminder.toString());
}

enum Magnitude { minute = 'minutes', hour = 'hours', day = 'days', week = 'weeks', month = 'months', year = 'years' }
export interface Reminder {
	userId: Snowflake,
	date: Moment,
	message: string,
}

export class Reminder {
	private static lastId: number = 0;
	id: number;
	userId: Snowflake;
	date: Moment;
	message: string;
	static readonly shortcuts: {regex: RegExp, args: string[]}[] = [
		{regex: /^tomorrow/i, args: ['1', 'days']},
		{regex: /^next\Wwee[kx]/i, args: ['7', 'days']},
	];

	private static getNextId() { return this.lastId++; }

	static load(userId: Snowflake, date: Moment | string, message: string): void {
		client.fetchUser(userId).then(user => {
			const reminder = new Reminder(userId);
			reminder.date = moment(date);
			reminder.message = message;

			addReminder(reminder, user);
		});
	}

	static parseTime(quantityInput: string, magnitudeInput: string): Moment {
		// Parse values
		const quantity: number = this.parseQuantity(quantityInput);
		const magnitude: Magnitude = this.parseMagnitude(magnitudeInput);
		d('Parsed:', quantity, magnitude);

		// Validate values
		if (isNaN(quantity)) {
			d(quantity);
			throw new Error('Invalid quantity');
		}
		if (quantity > 1000) {
			d(quantity);
			throw new Error('Quantity is too large. Try less than 1000.');
		}
		if (!magnitude) {
			d(magnitude);
			throw new Error('Invalid Magnitude.');
		}
		return moment().add(quantity, magnitude);
	}

	static isShortcut(args: string[]): boolean {
		return Reminder.shortcuts.find(s => s.regex.test(args[0])) !== undefined
			|| Reminder.shortcuts.find(s => s.regex.test(`${args[0]} ${args[1]}`)) !== undefined;
	}

	static getShortcut(args: string[]): string[] {
		let reminder = null;
		if (this.shortcuts.find(s => s.regex.test(args[0])) !== undefined) {
			return this.shortcuts.find(s => s.regex.test(args[0])).args.concat(drop(args, 1));
		}
		else if (this.shortcuts.find(s => s.regex.test(`${args[0]} ${args[1]}`)) !== undefined) {
			return this.shortcuts.find(s => s.regex.test(`${args[0]} ${args[1]}`)).args.concat(drop(args, 2));
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

	constructor(userId: Snowflake, args?: string[]) {
		this.id = Reminder.getNextId();
		this.userId = userId;
		if (args) {
			if (Reminder.isShortcut(args)) {
				d('recognized shortcut');
				args = Reminder.getShortcut(args);
			}

			// continue parsing
			this.date = Reminder.parseTime(args.shift(), args.shift());
			this.message = args.join(' ');
		}
	}

	toString(): string {
		return `'${this.message}' to ${this.userId} on ${this.date.calendar()}.`;
	}
}

export default function Remind(msg: Message, args: string[]): void {
	const user = msg.author;
	const reminder = new Reminder(user.id, args);

	if (reminder.date !== undefined) {
		pgclient.query({
			text: 'insert into reminders(user_id, date, message) values($1, $2, $3)',
			values: [reminder.userId, reminder.date.toISOString(true), reminder.message],
		}).then(() => {
			getUserConfig(user.id).then(({timezone}) => {
				if (timezone === undefined || timezone === null) {
					user.send('You have not configured your timezone yet, to do so use the config command like this: `' + process.env.PREFIX + 'config set timezone est`.' +
					' This message will be sent for every reminder you request until it is set. For now, all times will be shown in UTC.');
				}

				user.send(`${reminder.date.tz(timezone || 'utc').calendar()} you will be reminded of ${reminder.message || 'nothing'}.`);
				addReminder(reminder, user);
			});
		}).catch(err => {
			user.send('There was an error saving the reminder.');
			d(err);
		});
	}
}

export function loadReminders() {
	pgclient.query({
		text: 'select user_id, date, message from reminders where date > current_timestamp',
	}).then(({rows}) => rows.forEach(row => Reminder.load(row.user_id, row.date, row.message))).catch(d);
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Remind Help',
		description: 'Used to remind you of anything you need.',
		fields: [
			{
				name: 'Usage',
				value: `${process.env.PREFIX}remind [shortcut OR [magnitude] [prefix]] [message]`,
			},
			{
				name: 'shortcut',
				value: 'tomorrow | next week',
			},
			{
				name: 'magnitude',
				value: 'Any number less than 1000. Words or numbers are allowed.',
			},
			{
				name: 'message',
				value: 'Literally anything you want.',
			},
		],
	});
}
