import debug from 'debug';
import {Message} from 'discord.js';

const d = debug('bot.src.commands.sarcasm');

function convertToSarcasm(str: string): string { return str.split('').map((cc, key) => key % 2 === 1 ? cc.toUpperCase() : cc.toLowerCase()).join(''); }

export default function Sarcasm(msg: Message, args: string[]): void {
	msg.channel.send(convertToSarcasm(args.join(' ')));
}
