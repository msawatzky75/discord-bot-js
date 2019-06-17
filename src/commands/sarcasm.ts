import debug from 'debug';
import {
	Message,
	RichEmbed,
} from 'discord.js';

const d = debug('bot.src.commands.sarcasm');

function convertToSarcasm(str: string): string { return str.split('').map((cc, key) => key % 2 === 1 ? cc.toUpperCase() : cc.toLowerCase()).join(''); }

export default function Sarcasm(msg: Message, args: string[]): void {
	msg.channel.send(convertToSarcasm(args.join(' ')));
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Sarcasm Help',
		description: 'Capitalizes every other letter of text provided.',
	});
}
