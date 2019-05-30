import {Command} from '../types';
import {
	GuildMember,
	Message,
	MessageMentions,
	User,
} from 'discord.js';

export default class SetNickname implements Command {
	execute(msg: Message, args: string[]) {
		let user = msg.author;
		const name = args.filter(s => {
			if (s[0] === '!') {
				return false;
			}
			if (s.match(MessageMentions.USERS_PATTERN)) {
				user = msg.mentions.users[0];
				return false;
			}
		});
		console.log(user);
		console.log(args);
		// return msg.guild.fetchMember(user).then(u => u.setNickname(args))
	}
}
