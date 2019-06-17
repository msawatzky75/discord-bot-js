import {
	Message,
	MessageMentions,
} from 'discord.js';

export default function SetNickname(msg: Message, args: string[]) {
	throw new Error("Not yet implemented");
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
	// return msg.guild.fetchMember(user).then(u => u.setNickname(args))
}
