import debug from 'debug';
import {loadReminders} from './commands/remind';
import {client, pgclient} from './index';

const d = debug('bot.src.initialize');

export function initialize() {
	d(`Logged in as ${client.user.tag}`);
	d('setting status as online');
	client.user.setStatus('online').catch(d);
	pgclient.connect().then(() => {
		d('connected to postgres. to initialize the database, refer to the readme.');
		loadReminders();
	}).catch(d);
}
