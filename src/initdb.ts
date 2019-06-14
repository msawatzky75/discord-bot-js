import debug from 'debug';
import dotenv from "dotenv";
import {Client as PGClient} from 'pg';

const d = debug('bot.src.initdb');
dotenv.config({path: `${__dirname}/../.env`});

const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});
pgclient.connect().then(() => {
	pgclient.query({
		text: `
			create table if not exists reminders(
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
			`,
	}).then(() => process.exit(0)).catch(d);
}).catch(d);
