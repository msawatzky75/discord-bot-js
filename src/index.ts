import debug from 'debug';
import {
	Client,
	PresenceStatus,
} from 'discord.js';
import {Client as PGClient} from 'pg';
import {
	config,
	help,
	nickname,
	remind,
	sarcasm,
} from './commands';
import {loadReminders} from './commands/remind';

const d = debug('bot.src.index');
const client = new Client();
const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});

// This is needed or the bot attempts to start while running tests.
if (!process.env.TEST) {
	client.login(process.env.TOKEN).catch(d);
}

client.on('ready', () => {
	d(`Logged in as ${client.user.tag}`);
	d('setting status as online');
	client.user.setStatus('online' as PresenceStatus).catch(d);
	pgclient.connect().then(() => {
		d('connected to postgres, initializing');
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
			);`,
		}).catch(d);
		loadReminders();
	}).catch(d);
});

client.on('message', msg => {
	if (msg.content.startsWith(process.env.PREFIX)) {
		const args: string[] = msg.content.split(' ');
		const command: string = args.shift().substring(1);
		d('received command', [command, ...args]);

		try {
			switch(command) {
				case 'config':
					config(msg, args);
					break;

				case 'help':
					help(msg, args);
					break;

				case 'remindme':
				case 'remind':
					remind(msg.author, args);
					break;

				case 'sarcasm':
					sarcasm(msg, args);
					break;

				case 'setnick':
				case 'nickname':
					nickname(msg, args);
					break;

				default:
					d(`${msg.author.tag} tried ${msg.content}`);
					d('nothing registered to handle that.');
					break;
			}
		}
		catch (e) {
			msg.channel.send(e.message).catch(() => {
				msg.author.send(e.message);
			});
			d('this is for hoping we know what happened.');
			d(e);
		}
	}
});

client.on('error', e => {
	d('oof');
	d(e);
});

export {client, pgclient};
