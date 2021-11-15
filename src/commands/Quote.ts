import {Message, Snowflake, TextChannel} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Quote implements ICommand {
	public name = "quote";
	public description = "quotes a message";
	public aliases = ["q"];
	@inject(TYPES.QuoteChannel) private quoteChannel: Snowflake;
	@inject(TYPES.Logger) private logger: Logger;
	@inject(TYPES.Prefix) private prefix: string;

	public canHandle(message: Message): boolean {
		return message.content.startsWith(this.prefix + this.name);
	}

	public async handle(message: Message): Promise<Message | Message[]> {
		// get a random message from the quote channel and send it to the channel the command was sent in
		const quoteChannel = await message.guild.channels.cache.get(this.quoteChannel);

		if (quoteChannel instanceof TextChannel) {
			const messages = await quoteChannel.messages.fetch({limit: 100});

			const randomMessage = messages.random();
			return message.reply(`\`${randomMessage.content}\``);
		}

		return Promise.reject("Could not find quote channel");
	}
}
