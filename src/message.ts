import debug from 'debug';
import {Message} from 'discord.js';
import {
	CommandName,
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
		const command = normalizeCommandName(args.shift().substring(process.env.PREFIX.length));
		d([command, ...args]);

		try {
			emitter.emit('beforeCommand', command, msg);
			switch (command) {
				case CommandName.config:
					config(msg, args);
					break;

				case CommandName.help:
					help(msg, args);
					break;

				case CommandName.remind:
					remind(msg, args);
					break;

				case CommandName.sarcasm:
					sarcasm(msg, args);
					break;

				case CommandName.nickname:
					nickname(msg, args);
					break;

				default:
					d(`${msg.author.tag} tried ${msg.content}`);
					msg.channel.send('Invalid command.');
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
