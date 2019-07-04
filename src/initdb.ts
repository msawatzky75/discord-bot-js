import dotenv from 'dotenv';
import {Client as PGClient} from 'pg';

dotenv.config({path: `${__dirname}/../.env`});
const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});
pgclient.connect().then(() => {
	pgclient.query({
		text: `create table if not exists users(
			user_id text primary key,
			timezone text
		);
		create table if not exists guilds(
			guild_id text primary key,
			welcome_channel_id text
		);
		create table if not exists reminders(
			id serial primary key,
			user_id text,
			date timestamp not null,
			message text
		);
		create table if not exists sent_commands(
			user_id text,
			date timestamp not null,
			channel_id text not null,
			command_name text not null,
			guild_id text,
			message text not null,
			primary key (user_id, date)
		);`,
	}).then(() => process.exit(0));
});
