import debug from 'debug';
import {Client} from 'discord.js';
import * as dotenv from "dotenv";
import {Client as PGClient} from 'pg';
import Remind from './commands/remind';
// import SetNickname from './commands/setNickname';

dotenv.config({ path: `${__dirname}/../.env` });
const d = debug('bot.src.index');
const client = new Client();
const pgclient = new PGClient({
	connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

function loadReminders() {
	pgclient.query({
		text: "select snowflake, date, message from reminders where age(date) < interval '2 hours' and date > current_timestamp"
	}).then((res: any) => {
		res.rows.forEach(Remind.addReminder);
	}).catch(d)
}

Promise.all([client.login(process.env.TOKEN), pgclient.connect()]).then((values) => {
	d('Connected to discord and postgres');
	pgclient.query({
		text: 'create table if not exists reminders (snowflake text not null, date timestamp with time zone not null, reminder text, primary key (snowflake, date))'
	}).then(() => {
		loadReminders();
	})
}).catch((errors) => {
	d("error:", errors);
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if (msg.content.startsWith(process.env.PREFIX)) {
		const args: string[] = msg.content.split(' ');
		const command: string = args.shift().substring(1);

		switch(command) {
			case 'setnick':
				// SetNickname.execute(msg, args);
				break;

			case 'remindme':
			case 'remind':
				Remind.subscribe(msg.author, args);
				break;

			default:
				console.log(`${msg.author.tag} tried ${msg.content}`);
				break;
		}
	}
});

export {client, pgclient};
