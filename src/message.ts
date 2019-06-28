import debug from 'debug';
import {Message} from 'discord.js';
import {
	CommandNames,
	config,
	help,
	nickname,
	normalizeCommandName,
	remind,
	sarcasm,
} from './commands';
import {emitter} from './index';

const d = debug('bot.src.message');

export function onMessage(msg: Message) {
	if (msg.content.startsWith(process.env.PREFIX)) {
		const args: string[] = msg.content.split(' ');
		const command: string = args.shift().substring(process.env.PREFIX.length);
		d([command, ...args]);

		try {
			emitter.emit('beforeCommand', command, msg);
			switch (normalizeCommandName(command)) {
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
					msg.channel.send('Invalid command.');
					emitter.emit('dum', msg);
					break;
			}
			emitter.emit('afterCommand', command, msg);
		} catch (e) {
			msg.channel.send(e.message).catch(() => {
				msg.author.send(e.message).catch(d);
			});
			d('command error', e);
		}
	}
}
