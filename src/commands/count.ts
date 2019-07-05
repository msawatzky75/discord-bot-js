import debug from 'debug';
import {
	Message,
	RichEmbed,
} from 'discord.js';
import {pgclient} from '../index';
import {CommandName} from './index';

const d = debug('bot.src.commands.count');

export default function count(msg: Message, args: string[]): void {
	const search = args.join(' ');
	pgclient.query(`select count(1) from sent_commands where user_id = $1 ${search && search != 'all' ? 'and command_name = $2' : ''}`,
		search && search != 'all' ? [msg.author.id, search] : [msg.author.id]).then(({rows}) => {
		if (rows.length) {
			d(rows);
			const total = rows[0].count;
			let response = 'You sent ' ;
			switch (search) {
				case 'all':
					response += `a total of ${total} command${total > 1 ? 's': ''}.`;
					break;
				case 'invalid':
					response += `an invalid command ${total} time${total > 1 ? 's': ''}.`;
					break;
				default:
					response += `\`${search}\` ${total} time${total > 1 ? 's': ''}.`;
					break;
			}
			msg.reply(response).catch(d);
		}
	});
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Count',
		description: 'Shows you a count of a command that you use.',
		fields: [
			{
				name: 'Usage',
				value: `${process.env.PREFIX}count [command]`,
			},
			{
				name: 'Command',
				value: Object.values(CommandName).map(cmd =>`${cmd}`).join(' | '),
			},
		],
	});

}
