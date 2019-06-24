import {
	Message,
	MessageMentions,
	RichEmbed,
	User,
} from 'discord.js';

export default function SetNickname(msg: Message, args: string[]) {
	const mention: User = msg.mentions.users.first();
	const name: string = args.filter(s => !s.match(MessageMentions.USERS_PATTERN)).join(' ');

	// cannot be server owner.
	if (mention.id === msg.guild.ownerID) {
		throw new Error('Cannot change the nickname of the server owner.');
	}

	return msg.guild.fetchMember(mention).then(u => u.setNickname(name)).catch(e => {throw e;});
}

export function help(): RichEmbed {
	return new RichEmbed({
		color: 0x000000,
		title: 'Nickname Help',
		description: 'Used to modify the nickname of another user in a guild.',
		fields: [
			{
				name: 'Usage',
				value: `${process.env.PREFIX}nickname [@username] [nickname]`,
			},
			{
				name: '@username',
				value: 'any @ mentionable user',
			},
			{
				name: 'nickname',
				value: 'any valid nickname (as per discord specs) 32 characters or under.',
			},
		],
	});
}
