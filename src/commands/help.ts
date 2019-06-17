import {Message} from 'discord.js';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import * as Commands from './index';

export default function Help(msg: Message, args: string[]) {
	const command = args.join(' ');
	if (includes(map(keys(Commands), (c: string) => c.toLowerCase()), command.toLowerCase())) {
		// eslint-disable-next-line global-require
		msg.author.send(require(`./${command}`).help());
	}
}
