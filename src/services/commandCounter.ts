import debug from 'debug';
import {Message} from 'discord.js';
import {pgclient} from '../index';
import {CommandName} from '../commands';

const d = debug('bot.src.services.counter');

export function countCommand(msg: Message) {
	pgclient.query('select 1 from cmdcounts where userId = $1', [msg.author.id]).then(({rows}: {rows: {userId: string}[]}) => {
		if (rows.length) {
			//update
			pgclient.query('update cmdcounts set incorrect = incorrect + 1 where userId = $1', [msg.author.id]).catch(d);
		}
		else {
			//insert
			pgclient.query('insert into cmdcounts (userId, incorrect) values ($1, 1)', [msg.author.id]).catch(d);
		}
	});
}

export function getCommandCount(command: CommandName, userId: string) {
	let count = 0;
	pgclient.query('select $1 from cmdcounts where userId = $2', [command, userId]).then(({rows}) => {
		count = rows[0];
	});
	return count;
}
