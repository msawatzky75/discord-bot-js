import debug from 'debug';
import {Message} from 'discord.js';
import {pgclient} from '../index';
import {CommandName} from '../commands';

const d = debug('bot.src.services.counter');

export function countCommand(command: CommandName, msg: Message) {
	d(`counting command ${command} from ${msg.author.tag}`);
	pgclient.query('insert into sent_commands(user_id, date, channel_id, command_name, guild_id, message) values($1, $2, $3, $4, $5, $6);',
		[msg.author.id, new Date(), msg.channel.id, command, msg.guild ? msg.guild.id : null, msg.content]);
}

export function getCommandCount(command: CommandName, userId: string): Promise<number> {
	return new Promise(((resolve, reject) => {
		pgclient.query('select id from commands where name = $1', [command]).then(({rows}) => {
			const commandId = rows[0].id;
			if (!commandId) {
				reject({message: 'Invalid Command', commandId});
			}
			pgclient.query('select count(1) from sent_commands where user_id = $1 and command_id = $2', [userId, commandId]).then(({rows}) => {
				resolve(rows[0]['count(1)']);
			});
		});
	}));
}
