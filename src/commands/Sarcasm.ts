import {Message} from "discord.js";
import {injectable} from "inversify";

@injectable()
export class Sarcasm {
	public name = "sarcasm";
	public description = "converts message into alternating-caps";

	public execute(message: Message) {
		return message.reply(
			message.content
				.split("")
				.map((char, index) => {
					return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
				})
				.join(""),
		);
	}
}
