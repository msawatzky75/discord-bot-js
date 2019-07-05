import {
	Message,
	RichEmbed,
} from 'discord.js';
import {
	CommandName,
	normalizeCommandName,
} from './index';

export function help(): RichEmbed {
	// wow, really dont know what to do, do ya?
	return new RichEmbed({
		color: 0x000000,
		title: 'Help',
		description: 'Describes what other commands do.',
		fields: [
			{
				name: 'Usage',
				value: `${process.env.PREFIX}help [command]`,
			},
			{
				name: 'Command',
				value: Object.values(CommandName).map(cmd => cmd !== CommandName.invalid ? `${cmd}`: '').join(' | '),
			},
		],
	});
}

export default function Help(msg: Message, args: string[]) {
	const command = normalizeCommandName(args.join(' '));
	if (command !== CommandName.invalid) {
		// eslint-disable-next-line
		const cmd = require(`./${command}`);
		if (cmd.hasOwnProperty('help')) {
			msg.author.send(cmd.help());
		}
		else {
			msg.author.send('There is no help for that command yet.');
		}
	}
	else {
		msg.author.send(help());
	}
}
