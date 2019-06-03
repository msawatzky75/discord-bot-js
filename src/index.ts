import debug from 'debug';
import {Client} from 'discord.js';
import {connect} from 'mongoose';
import {TOKEN, PREFIX, MONGOURL, MONGODB} from './enviroment';
import Remind from './commands/remind';
import SetNickname from './commands/setNickname';

const d = debug('bot.src.index');

const setNick = new SetNickname();
const remind = new Remind();
const client = new Client();
let db;

Promise.all([connect(`${MONGOURL}/${MONGODB}`, {useNewUrlParser: true, useFindAndModify: false}), client.login(TOKEN)]).then((values) => {
	db = values[0];
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if (msg.content.startsWith(PREFIX)) {
		const args = msg.content.split(' ');
		const command = args.shift().substring(1);

		switch(command) {
			case 'setnick':
				setNick.execute(msg, args);
				break;

			case 'remindme':
			case 'remind':
				remind.subscribe(msg.author, args);
				break;

			default:
				console.log(`${msg.author.tag} tried ${msg.content}`);
				break;
		}
	}
});


