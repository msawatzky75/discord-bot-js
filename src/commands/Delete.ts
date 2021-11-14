import {Message, TextChannel} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Delete implements ICommand {
	public name = "delete";
	public description = "Deletes a message";
	public aliases = ["del", "rm", "d"];
	public usage = "delete <number of messages to be deleted>";
	@inject(TYPES.Logger) private logger: Logger;
	@inject(TYPES.DeleteConfirmation) private deleteConfirmation: number;

	public canHandle(message: Message, prefix: string): boolean {
		return this.getEndOfCommandIndex(message, prefix) !== -1;
	}

	public handle(message: Message, prefix: string): Promise<Message | Message[]> {
		const args = message.content.substring(this.getEndOfCommandIndex(message, prefix)).trim().split(" ");

		if (args.length > 0) {
			// check if the first argument is a number
			const num = parseInt(args[0], 10);

			if (Number.isNaN(num)) {
				return Promise.reject("First argument is not a number");
			}

			this.logger.debug(`Deleting ${num} messages`);
			if (message.channel instanceof TextChannel) {
				this.logger.log(`Deleting ${num} messages from ${message.channel.name}`);
				return message.channel.bulkDelete(num).then((messages) => {
					// send confirmation message and self destruct
					return message.channel.send(`Deleted ${messages.size} messages`).then((msg) => {
						if (this.deleteConfirmation > 0) {
							setTimeout(async () => {
								msg.delete();
							}, this.deleteConfirmation);
						}
						return msg;
					});
				});
			}

			return Promise.reject("Channel is not a text channel");
		}
		return Promise.reject("No arguments provided");
	}

	private getEndOfCommandIndex(message: Message, prefix: string): number {
		const commandWithPrefix = message.content.split(" ")[0];

		const alias = [this.name, ...this.aliases].find((alias) =>
			new RegExp(`${prefix}${alias}$`).test(commandWithPrefix),
		);

		if (alias) {
			return message.content.indexOf(commandWithPrefix) + commandWithPrefix.length;
		}

		return -1;
	}
}
