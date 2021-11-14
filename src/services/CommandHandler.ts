import {Message} from "discord.js";
import {inject, injectable, multiInject} from "inversify";
import {TYPES} from "../types";
import {ICommand} from "../commands/ICommand";
import {Logger} from "../logger";

@injectable()
export class CommandHandler {
	@multiInject(TYPES.Commands) public commands: ICommand[];
	@inject(TYPES.Prefix) private prefix: string;
	@inject(TYPES.Logger) private logger: Logger;

	handle(message: Message): Promise<Message | Message[]> {
		if (!message.content.startsWith(this.prefix)) {
			// its just a normal message
			this.logger.verbose(`Message does not start with prefix: ${message.content}`);
			return Promise.reject();
		}

		if (message.content.startsWith(`${this.prefix}help`)) {
			return this.help(message);
		}

		const promise = this.commands.reduce<Promise<Message | Message[]> | undefined>(
			(promise, command: ICommand) => {
				if (command.canHandle(message, this.prefix)) {
					this.logger.log(`CommandHandler handling command: ${command.name}`);
					return command.handle(message, this.prefix);
				}
				return promise;
			},
			undefined,
		);

		if (promise) {
			return promise;
		}

		return Promise.reject("Command not found!");
	}

	private help(message: Message): Promise<Message | Message[]> {
		// list all commands
		return message.reply(`Available commands: ${this.commands.map((c) => c.name).join(", ")}`);
	}
}
