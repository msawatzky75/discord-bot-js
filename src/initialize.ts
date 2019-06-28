import debug from 'debug';
import {PresenceStatus} from 'discord.js';
import {loadReminders} from './commands/remind';
import {client, pgclient} from './index';

const d = debug('bot.src.initialize');

export function initialize() {
	d(`Logged in as ${client.user.tag}`);
	d('setting status as online');
	client.user.setStatus('online' as PresenceStatus).catch(d);
	pgclient.connect().then(() => {
		d('connected to postgres, initializing');
		// timeout for docker, to make sure the database is started before connecting.
		setTimeout(() =>
			pgclient.query({
				text: `create table if not exists reminders(
				userId text not null,
				date timestamp with time zone not null,
				message text,
				primary key (userId, date)
			);
			create table if not exists timezones(
				userId text primary key,
				timezone text not null
			);
			create table if not exists welcomes(
				guildId text primary key,
				channelId text not null
			);
			create table if not exists commandCounts(
				`,
			}).catch(d), Number(process.env.CONNECTION_DELAY) || 10000);
		loadReminders();
	}).catch(d);
}
