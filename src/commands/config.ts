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
	const timezones = moment.tz.names().map(s => s.toLowerCase());
	const simpleTimezones = timezones.map(s => s.split('/')[1]);
	const input = str.toLowerCase();

	if (includes(timezones, input)){
		return moment.tz.names()[timezones.indexOf(input)];
	}
	else if (includes(simpleTimezones, input)) {
		return moment.tz.names()[simpleTimezones.indexOf(input)];
	}
	return null;
}

export default function Config(msg: Message, args: string[]) {
	const config: ConfigOptions = {
		type: parseConfigType(args.shift()),
		property: parseConfigProperty(args.shift()),
		value: args.join(' '),
	};
	d('config options:', config);

	switch (config.property) {
		case ConfigProperty.welcome:
			break;

		case ConfigProperty.timezone:
			d('setting timezone');
			// if there is a value for timezone, try and parse it before continuing.
			if (config.value) {
				config.value = parseTimeZone(config.value);
				d('parsed timezone to be', config.value);
			}
			if (config.value) {
				pgclient.query({
					text: "select timezone from timezones where userId = $1",
					values: [msg.author.id],
				}).then(({rows, rowCount}) => {
					const prevTimezone = rows[0] ? rows[0].timezone : 'unset';
					msg.author.send(`Changing timezone from '${prevTimezone}' to '${config.value}'`);
					pgclient.query(rowCount ? 'update timezones set timezone = $2 where userId = $1' : 'insert into timezones(userId, timezone) values($1, $2)',
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
