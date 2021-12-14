import {Message} from "discord.js";

export interface ICommand {
	name: string;
	description: string;
	aliases?: string[];
	adminOnly?: boolean;
	canHandle(message: Message): boolean;
	handle(message: Message): Promise<Message | Message[]>;
}
