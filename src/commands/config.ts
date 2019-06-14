import {Message} from 'discord.js';
import debug from 'debug';
import findKey from 'lodash/findKey';
import {pgclient} from '../index';
import {Executable} from '../typings';

const d = debug('bot.src.commands.config');

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

	static parseTimeZone(str: string): string | null {
		return str;
	}

	static execute(msg: Message, args: string[]) {
		const config: ConfigOptions = {
			type: Config.parseConfigType(args.shift()),
			property: Config.parseConfigProperty(args.shift()),
			value: args.join(' '),
		};
		switch (config.property) {
			case ConfigProperty.timezone:
				break;

			case ConfigProperty.welcome:
				const zone = Config.parseTimeZone(args.join(' '));
				if (zone) {
					pgclient.query({
						text: "select 1 from timezones where userId = $1",
						values: [msg.author.id],
					}).then(results => {
						const queryConfig = {
							text: results.rowCount ? 'update timezones set timezone = $2 where userId = $1' : 'insert into timezones(userId, timezone) values($1, $2)',
							values: [msg.author.id, zone],
						};

						pgclient.query(queryConfig).catch(d);
					});
				}
				break;
		}
		d(config);
	}
}
