import debug from 'debug';
import {Client} from 'discord.js';
import dotenv from "dotenv";
import {Client as PGClient} from 'pg';
import {Config, Help, Nickname, Remind, Sarcasm} from './commands';

dotenv.config({path: `${__dirname}/../.env`});
const d = debug('bot.src.index');
const client = new Client();
const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});

// This is needed or the bot attempts to start while running tests.
if (!process.env.TEST) {
	client.login(process.env.TOKEN).catch(d);
	pgclient.connect().then(() => d('Connected to postgres')).catch(d);
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if (msg.content.startsWith(process.env.PREFIX)) {
		const args: string[] = msg.content.split(' ');
		const command: string = args.shift().substring(1);
		d('received command', command, args);

		try {
			switch(command) {
				case 'setnick':
					Nickname(msg, args);
					break;

				case 'remindme':
				case 'remind':
					Remind(msg.author, args);
					break;

				case 'sarcasm':
					Sarcasm(msg, args);
					break;

				case 'config':
					Config(msg, args);
					break;

				case 'help':
					Help(msg, args);
					break;

				default:
					console.log(`${msg.author.tag} tried ${msg.content}`);
					break;
			}
		}
		catch (e) {
			d(e);
			msg.author.send(e.message);
		}
	}
});

client.on('guildMemberAdd', member => {
	// Welcome(member);
});

export {client, pgclient};
