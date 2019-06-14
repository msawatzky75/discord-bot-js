import debug from 'debug';
import {Client} from 'discord.js';
import dotenv from "dotenv";
import {Client as PGClient} from 'pg';
import {Config, Help, Nickname, Remind, Sarcasm, Welcome} from './commands';

dotenv.config({path: `${__dirname}/../.env`});
const d = debug('bot.src.index');
const client = new Client();
const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});

function loadReminders() {
	pgclient.query({
		text: "select userId, date, message from reminders where age(date) < interval '2 hours' and date > current_timestamp",
	}).then(res => {
		res.rows.forEach(Remind.addReminder);
	}).catch(d)
}

Promise.all([client.login(process.env.TOKEN), pgclient.connect()]).then(() => {
	d('Connected to discord and postgres');
	loadReminders();
}).catch(d);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if (msg.content.startsWith(process.env.PREFIX)) {
		const args: string[] = msg.content.split(' ');
		const command: string = args.shift().substring(1);

		switch(command) {
			case 'setnick':
				Nickname.execute(msg, args);
				break;

			case 'remindme':
			case 'remind':
				Remind.subscribe(msg.author, args);
				break;

			case 'sarcasm':
				Sarcasm.execute(msg, args);
				break;

			case 'config':
				Config.execute(msg, args);
				break;

			case 'help':
				Help.execute(msg, args);
				break;

			default:
				console.log(`${msg.author.tag} tried ${msg.content}`);
				break;
		}
	}
});

client.on('guildMemberAdd', member => {
	Welcome.execute(member);
});

// heroku workaround.
// require('http').createServer(() => console.log('some sucker just tried to look at this like a website.')).listen(process.env.PORT || 80);
export {client, pgclient};
