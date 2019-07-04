import debug from 'debug';
import events from 'events';
import {Client} from 'discord.js';
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

client.once('ready', initialize);
client.on('error', e => d('discord client error', e));
client.on('guildMemberAdd', welcome);
client.on('message', onMessage);
emitter.on('beforeCommand', countCommand);
