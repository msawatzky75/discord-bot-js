import debug from 'debug';
import {
	MessageMentions,
	Message,
} from 'discord.js';
import {Executable} from '../typings';

const d = debug('bot.src.commands.sarcasm');

export default class Sarcasm extends Executable {
	private static convertToSarcasm(str: string): string { return str.split('').map((cc, key) => key % 2 === 1 ? cc.toUpperCase() : cc.toLowerCase()).join(''); }
	static execute(msg: Message, args: string[]): void {
		msg.channel.send(Sarcasm.convertToSarcasm(args.join(' ')));
	}
}
