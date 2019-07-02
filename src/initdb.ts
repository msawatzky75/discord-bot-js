import debug from 'debug';
import dotenv from 'dotenv';
import {Client as PGClient} from 'pg';

const d = debug('bot.src.initdb');
dotenv.config({path: `${__dirname}/../.env`});
const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});
pgclient.connect().then(() => {
	pgclient.query({
		text: `create table if not exists users(
			userId text primary key,
			timezone text
		);
		create table if not exists commands(
			id serial primary key,
			name text not null
		);
		create table if not exists guilds(
			guild_id text primary key,
			welcome_channel_id text
		);
		create table if not exists reminders(
			reminder_id serial primary key,
			user_id text references users(user_id),
			date timestamp not null,
			message text
		);
		create table if not exists sent_commands(
			user_id text references users(user_id),
			date timestamp not null,
			channel_id text not null,
			command_id integer references commands(id),
			guild_id text not null,
			message text not null,
			primary key (user_id, date)
		);`,
	}).then(() => process.exit(0)).catch(d);
}).catch(d);
