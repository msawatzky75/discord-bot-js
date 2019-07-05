import {
	Message,
	RichEmbed,
	Snowflake,
	User,
} from 'discord.js';
import debug from 'debug';
import camelCase from 'lodash/camelCase';
import findKey from 'lodash/findKey';
import includes from 'lodash/includes';
import mapKeys from 'lodash/mapKeys';
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
interface UserConfig {
	userId: Snowflake,
	timezone: string,
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
					text: 'select timezone from users where user_id = $1',
					values: [msg.author.id],
				}).then(({rows, rowCount}) => {
					const prevTimezone = rows[0] ? rows[0].timezone : 'unset';
					msg.author.send(`Changing timezone from '${prevTimezone}' to '${config.value}'`);
					pgclient.query(rowCount ? 'update users set timezone = $2 where user_id = $1' : 'insert into users(user_id, timezone) values($1, $2)',
						[msg.author.id, config.value]).catch(d);
				});
			}
			break;

		default:
			throw new Error(`${config.property} is not a valid property.`);
	}
}

export function getUserConfig(userId: Snowflake): Promise<UserConfig> {
	return new Promise((resolve, reject) => {
		pgclient.query('select * from users where user_id = $1', [userId]).then(({rows}) => {
			if(rows[0]) {
				resolve(mapKeys(rows[0], camelCase).toObject() as UserConfig);
			}
			else {
				pgclient.query('insert into users(user_id) values($1)', [userId]).then(() => {
					resolve({userId, timezone: 'utc'});
				});
			}
		}).catch(reject);
	});
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Config Help',
		description: 'Used to configure settings as needed.',
		fields: [
			{
				name: 'Usage',
				value: `${process.env.PREFIX}config [action] [property] [value]`,
			},
			{
				name: 'Actions',
				value: 'set | update | remove',
			},
			{
				name: 'Properties',
				value: 'timezone',
			},
		],
	});
}
