import debug from 'debug';
import {GuildMember} from 'discord.js';
import {Event} from '../typings';

const d = debug('bot.src.commands.welcome');

export default class Welcome extends Event {
	static execute(member: GuildMember) {
		d('this is where we welcome the new guy');
	}
}
