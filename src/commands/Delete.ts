import {Message, TextChannel} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {Command} from "./Command";
import {ICommand} from "./ICommand";

@injectable()
export class Delete extends Command implements ICommand {
	public name = "delete";
	public description = "Deletes a message";
	public aliases = ["del", "rm", "d"];
	public usage = "delete <number of messages to be deleted>";
	public adminOnly = true;
	@inject(TYPES.DeleteConfirmation) private deleteConfirmation: number;

	constructor() {
		super();
		this.logger.context = "Delete";
	}

	public canHandle(message: Message): boolean {
		return this.getEndOfCommandIndex(message, this.prefix) !== -1;
	}

	public async handle(message: Message): Promise<Message | Message[]> {
		const args = message.content.substring(this.getEndOfCommandIndex(message, this.prefix)).trim().split(" ");

		if (!(message.channel instanceof TextChannel)) {
			return Promise.reject("Channel is not a text channel");
		}
		if (!args.length) {
			return Promise.reject("No arguments provided");
		}

		// check if the first argument is a number
		const num = parseInt(args[0], 10);

		if (Number.isNaN(num)) {
			return Promise.reject("First argument is not a number");
		}

		this.logger.debug(`Deleting ${num} messages`);
		this.logger.log(`Deleting (${num} + 1) messages from ${message.channel.name}`);

		// add one for the command message
		const deletedMessages = await message.channel.bulkDelete(num + 1);
		// send confirmation message and self destruct
		const msg = await message.channel.send(`Deleted ${deletedMessages.size - 1} messages`);
		if (this.deleteConfirmation > 0) {
			setTimeout(async () => {
				msg.delete();
			}, this.deleteConfirmation);
		}
		return msg;
	}
}
