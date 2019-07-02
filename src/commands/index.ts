import config from './config';
import help from './help';
import nickname from './nickname';
import remind from './remind';
import sarcasm from './sarcasm';
import findKey from 'lodash/findKey';

enum CommandName {
	config = 'config',
	help = 'help',
	nickname = 'nickname',
	remind = 'remind',
	sarcasm = 'sarcasm',
	invalid = 'invalid',
}

export {
	CommandName,
	config,
	help,
	nickname,
	remind,
	sarcasm,
};

export function normalizeCommandName(input: string): CommandName {
	return findKey({
		[CommandName.config]: /config/i,
		[CommandName.help]: /help/i,
		[CommandName.nickname]: /(set)?nick(name)?/i,
		[CommandName.remind]: /remind(me)?/i,
		[CommandName.sarcasm]: /sarcasm/i,
	}, val => val.test(input)) as CommandName || CommandName.invalid;
}
