import debug from 'debug';
import {Client} from 'discord.js';
import * as dotenv from "dotenv";
import {Client as PgClient} from 'pg';
import Remind from './commands/remind';
// import SetNickname from './commands/setNickname';

dotenv.config({ path: `${__dirname}/../.env` });
const d = debug('bot.src.index');
const client = new Client();
const pgclient = new PgClient({
	connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

Promise.all([client.login(process.env.TOKEN), pgclient.connect()]).then((values) => {
	d('Connected to discord and postgres');
	d(values);
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
