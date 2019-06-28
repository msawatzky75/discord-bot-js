import debug from 'debug';
import {Message} from 'discord.js';
import {pgclient} from '../index';
import {CommandNames} from '../commands';

const d = debug('bot.src.services.counter');

export function countCommand(msg: Message) {
	pgclient.query('select 1 from commandCounts where userId = $1', [msg.author.id]).then(({rows}: {rows: {userId: string}[]}) => {
		if (rows.length) {
			//update
			pgclient.query('update commandCounts set incorrect = incorrect + 1 where userId = $1', [msg.author.id]).catch(d);
		}
		else {
			//insert
			pgclient.query('insert into commandCounts (userId, incorrect) values ($1, 1)', [msg.author.id]).catch(d);
		}
	});
}

export function getCommandCount(command: string) {
	if ()
	pgclient.query('select ')
}
