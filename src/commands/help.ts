import {
	Message,
	RichEmbed,
} from 'discord.js';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import * as Commands from './index';

export default function Help(msg: Message, args: string[]) {
	const command = args.join(' ') || 'help';
	if (includes(map(keys(Commands), (c: string) => c.toLowerCase()), command.toLowerCase())) {
		// eslint-disable-next-line global-require
		msg.author.send(require(`./${command}`).help());
	}
}

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
				value: 'config | help | remind | sarcasm',
			},
		],
	});
}
