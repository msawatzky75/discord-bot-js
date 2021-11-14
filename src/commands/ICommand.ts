import {Message} from "discord.js";

export interface ICommand {
	name: string;
	description: string;
	canHandle(message: Message, prefix: string): boolean;
	handle(message: Message, prefix?: string): Promise<Message | Message[]>;
}
