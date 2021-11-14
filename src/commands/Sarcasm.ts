import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Sarcasm implements ICommand {
	public name = "sarcasm";
	public description = "converts message into alternating-caps";
	@inject(TYPES.Logger) private logger: Logger;

	public canHandle(message: Message, prefix: string): boolean {
		return message.content.startsWith(prefix + this.name);
	}

	public handle(message: Message): Promise<Message | Message[]> {
		const content = message.content.substring(message.content.indexOf(this.name) + this.name.length);
		if (content) {
			return message.reply(this.altenateCaps(content));
		}
		return message.reply("I don't know what to do with that");
	}

	private altenateCaps(s: string): string {
		return s
			.split("")
			.map((char, index) => {
				return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
			})
			.join("");
	}
}
