import debug
	from 'debug';
import events
	from 'events';
import {
	Client,
	Message,
	User,
} from 'discord.js';
import {Client as PGClient} from 'pg';
import {countCommand, welcome} from './services';
import {initialize} from './initialize';
import {onMessage} from './message';

const d = debug('bot.src.index');
export const client = new Client();
export const pgclient = new PGClient({connectionString: process.env.DATABASE_URL});
export const emitter = new events.EventEmitter();

// This is needed or the bot attempts to start while running tests.
if (!process.env.TEST) {
	client.login(process.env.TOKEN).catch(d);
}

client.on('error', e => d('discord client error', e));
client.on('guildMemberAdd', member => emitter.emit('userJoin', member));
client.on('message', onMessage);
client.once('ready', initialize);

emitter.on('beforeCommand', (command: string, {author}: Message) => countCommand(command, author));
emitter.on('userJoin', welcome);
