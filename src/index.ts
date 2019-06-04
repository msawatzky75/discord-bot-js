import debug from 'debug';
import {Client} from 'discord.js';
import {TOKEN, PREFIX, MONGOURL, MONGODB} from './enviroment';
import Remind from './commands/remind';
// import SetNickname from './commands/setNickname';

const d = debug('bot.src.index');
const client = new Client();
let db;

Promise.all([client.login(TOKEN)]).then((values) => {
	db = values[0];
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if (msg.content.startsWith(PREFIX)) {
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


