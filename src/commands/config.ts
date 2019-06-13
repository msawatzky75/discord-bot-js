import {Executable} from '../typings';
import {Message} from 'discord.js';
import {pgclient} from '../index';
import findKey from 'lodash/findKey';

enum ConfigType {
	set = 'set',
	update = 'update',
	remove = 'remove',
}

export default class Config extends Executable {
	static parseConfigType(str: string): ConfigType {
		return findKey({
			[ConfigType.set]: /set/i,
			[ConfigType.update]: /update/i,
			[ConfigType.remove]: /remove|delete/i,
		}, val => val.test(str)) as ConfigType;
	}

	static execute(msg: Message, args: string[]) {
		const configType: ConfigType = Config.parseConfigType(args.shift());
	}
}
