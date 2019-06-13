import {Executable} from '../typings';
import {Message} from 'discord.js';
import {pgclient} from '../index';
import findKey from 'lodash/findKey';

enum ConfigType {
	set = 'set',
	update = 'update',
	remove = 'remove',
}
enum ConfigProperty {
	timezone = 'timezone',
	welcome = 'welcome',
}
interface ConfigOptions {
	type: ConfigType,
	property: ConfigProperty,
	value: string,
}

export default class Config extends Executable {
	static parseConfigType(str: string): ConfigType {
		return findKey({
			[ConfigType.set]: /set/i,
			[ConfigType.update]: /update/i,
			[ConfigType.remove]: /remove|delete/i,
		}, val => val.test(str)) as ConfigType;
	}

	static parseConfigProperty(str: string): ConfigProperty {
		return findKey({
			[ConfigProperty.timezone]: /timezone/i,
			[ConfigProperty.welcome]: /welcome|greeting|welcomechannel/i,
		}, val => val.test(str)) as ConfigProperty;
	}

	static execute(msg: Message, args: string[]) {
		const config: ConfigOptions = {
			type: Config.parseConfigType(args.shift()),
			property: Config.parseConfigProperty(args.shift()),
			value: args.join(' '),
		}
	}
}
