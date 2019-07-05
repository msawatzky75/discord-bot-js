import debug from 'debug';
import {
	Message,
	MessageMentions,
	RichEmbed,
	User,
} from 'discord.js';

const d = debug('bot.src.commands.nickname');

export default function SetNickname(msg: Message, args: string[]) {
	const mention: User = msg.mentions.users.first();
	const name: string = args.filter(s => !s.match(MessageMentions.USERS_PATTERN)).join(' ');

	// cannot be in dm channels
	if (msg.channel.type !== 'text') {
		throw new Error('That command can only be used in guild text channels.');
	}

	// cannot be server owner.
	if (mention.id === msg.guild.ownerID) {
		throw new Error('Cannot change the nickname of the server owner.');
	}

	msg.guild.fetchMember(mention).then(u => {
		u.setNickname(name).catch(e => {
			d(`Missing Permissions to change ${u.user.tag}'s nickname in ${msg.guild.name}`);
			if (e.message === 'Missing Permissions') {
				msg.reply('I don\'t have sufficient permissions to change that user\'s nickname.');
			}
		});
	});
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
				value: 'Any @ mentionable user.',
			},
			{
				name: 'nickname',
				value: 'Any valid nickname (as per discord specs) 32 characters or under.',
			},
		],
	});
}
