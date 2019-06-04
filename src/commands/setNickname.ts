import {
	Message,
	MessageMentions,
} from 'discord.js';
import {Executable} from '../typings';

export default class SetNickname extends Executable {
	static execute(msg: Message, args: string[]) {
		let user = msg.author;
		const name = args.filter(s => {
			if (s[0] === '!') {
				return false;
			}
			if (s.match(MessageMentions.USERS_PATTERN)) {
				// user = msg.mentions.users[0];
				return false;
			}
		});
		console.log(user);
		console.log(args);
		// return msg.guild.fetchMember(user).then(u => u.setNickname(args))
	}
}
