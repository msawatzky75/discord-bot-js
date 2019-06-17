import {Message, RichEmbed} from 'discord.js';
import debug from 'debug';
import findKey from 'lodash/findKey';
import includes from 'lodash/includes';
import {pgclient} from '../index';
import moment from 'moment-timezone';

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

function parseConfigType(str: string): ConfigType {
	return findKey({
		[ConfigType.set]: /set/i,
		[ConfigType.update]: /update/i,
		[ConfigType.remove]: /remove|delete/i,
	}, val => val.test(str)) as ConfigType;
}

function parseConfigProperty(str: string): ConfigProperty {
	return findKey({
		[ConfigProperty.timezone]: /timezone/i,
		[ConfigProperty.welcome]: /welcome|greeting|welcomechannel/i,
	}, val => val.test(str)) as ConfigProperty;
}

function parseTimeZone(str: string): string | null {
	if (includes(moment.tz.names(), str.trim())){
		return str;
	}
	return null;
}

export default function Config(msg: Message, args: string[]) {
	const config: ConfigOptions = {
		type: parseConfigType(args.shift()),
		property: parseConfigProperty(args.shift()),
		value: args.join(' '),
	};
	switch (config.property) {
		case ConfigProperty.welcome:
			break;

		case ConfigProperty.timezone:
			// if there is a value for timezone, try and parse it before continuing.
			if (config.value) {
				config.value = parseTimeZone(config.value);
			}
			if (config.value) {
				pgclient.query({
					text: "select timezone from timezones where userId = $1",
					values: [msg.author.id],
				}).then(results => {
					msg.author.send(`Changing timezone from '${results.rows[0].timezone}' to '${config.value}'`);
					pgclient.query(results.rowCount ? 'update timezones set timezone = $2 where userId = $1' : 'insert into timezones(userId, timezone) values($1, $2)',
						[msg.author.id, config.value]).catch(d);
				});
			}
			break;

		default:
			msg.author.send(`${config.property} is not a valid property.`);
			break;
	}
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Config Help',
		description: 'Used to configure settings as needed.',
		fields: [
			{
				name: 'Usage',
				value: '!config [action] [property] [value]',
			},
			{
				name: 'Actions',
				value: 'set, update, remove',
			},
			{
				name: 'Properties',
				value: 'timezone, welcomechannel',
			},
		],
	});
}
