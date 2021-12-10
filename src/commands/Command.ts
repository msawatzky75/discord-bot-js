import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Command implements ICommand {
	@inject(TYPES.Prefix) protected prefix: string;
	@inject(TYPES.Logger) protected logger: Logger;

	public name: string;
	public description = "A command that has no description.";
	public usage = "This command has no usage";
	public aliases: string[];

	public canHandle(message: Message): boolean {
		return this.getEndOfCommandIndex(message, this.prefix) !== -1;
	}

	public handle(message: Message<boolean>): Promise<Message<boolean> | Message<boolean>[]> {
		throw new Error("Method not implemented.");
	}

	protected getEndOfCommandIndex(message: Message, prefix: string): number {
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
