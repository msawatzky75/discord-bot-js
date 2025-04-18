import debug from "debug";
import {Collection, Message, Snowflake, TextChannel} from "discord.js";
const d = debug("bot.helpers.messages");

const lastUpdate = new Collection<Snowflake, Date>();
export const messages = new Collection<Snowflake, Collection<string, Message<true>>>();

export async function getMessages(quoteChannel: TextChannel, cacheLife: number = 1000 * 60 * 15) {
	let serverMessages = messages.get(quoteChannel.guildId);
	const timeSinceUpdate = new Date().getTime() - (lastUpdate.get(quoteChannel.guildId)?.getTime() ?? 0);

	if (!serverMessages) {
		d(`No cache for ${quoteChannel.guild.name}, fetching quotes...`);
		await updateMessages(quoteChannel);
		serverMessages = messages.get(quoteChannel.guildId);
	} else if (timeSinceUpdate >= cacheLife) {
		d(`Cache expired for ${quoteChannel.guild.name}, fetching quotes...`);
		await updateMessages(quoteChannel);
		serverMessages = messages.get(quoteChannel.guildId);
	}
	return serverMessages;
}

async function updateMessages(quoteChannel: TextChannel) {
	const limit = 100;

	let quoteMessages: Collection<string, Message<true>> = new Collection();
	let fetchedMessageCount = 0;
	let pages = 0;

	do {
		d(`fetching ${limit} new messages...`);
		const newMessages = await quoteChannel.messages.fetch({limit: limit, before: quoteMessages.last()?.id});
		fetchedMessageCount = newMessages.size;
		quoteMessages = quoteMessages.concat(newMessages);
		pages++;
	} while (fetchedMessageCount === limit);

	d(`fetched ${quoteMessages.size} messages over ${pages} pages`);
	messages.set(quoteChannel.guildId, quoteMessages);
	lastUpdate.set(quoteChannel.guildId, new Date());
}
