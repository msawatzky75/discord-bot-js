import debug from 'debug';
import {Message} from 'discord.js';
import {pgclient} from '../index';

const d = debug('bot.src.commands.count');

export default function count(msg: Message, args: string[]): void {
	pgclient.query('select count(1) from sent_commands where user_id = $1 and command_name = $2', [msg.author.id, args.join(' ')]).then(({rows}) => {
		if (rows.length) {
			d(rows);
			const response = `You sent '${args.join(' ')}' ${rows[0].count} times`;
			msg.reply(response).catch(d);
		}
	});
}
