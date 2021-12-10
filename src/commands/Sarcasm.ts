import {Message} from "discord.js";
import {injectable} from "inversify";
import {Command} from "./Command";
import {ICommand} from "./ICommand";

@injectable()
export class Sarcasm extends Command implements ICommand {
	public name = "sarcasm";
	public description = "converts message into alternating-caps";
	public usage = "sarcasm <message>";
	public aliases: string[] = ["s"];

	public canHandle(message: Message): boolean {
		return this.getEndOfCommandIndex(message, this.prefix) !== -1;
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
