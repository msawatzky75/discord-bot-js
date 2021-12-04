import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {GuildConfigRepository} from "../repositories/GuildConfig";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Config implements ICommand {
	public name = "config";
	public description = "Configures the bot for the server";
	public aliases: string[] = [];
	public usage = "config <option> <value>";
	@inject(TYPES.Logger) private logger: Logger;
	@inject(TYPES.Prefix) private prefix: string;
	@inject(TYPES.GuildConfig) private guildConfig: GuildConfigRepository;

	public canHandle(message: Message): boolean {
		return this.getEndOfCommandIndex(message, this.prefix) !== -1;
	}

	public async handle(message: Message): Promise<Message | Message[]> {
		const args = message.content.substring(this.getEndOfCommandIndex(message, this.prefix)).trim().split(" ");

		if (args.length > 0) {
			const option = args[0];
			const value = args.slice(1).join(" ");

			switch (option) {
				case "prefix":
					return this.setPrefix(message, value);
				default:
					return message.channel.send(`Unknown option ${option}`);
			}
		}
		return Promise.reject("No arguments provided");
	}

	private async setPrefix(message: Message, prefix: string) {
		if (prefix.length > 1) {
			return message.channel.send("Prefix must be one character");
		}

		const guildConfig = await this.guildConfig.findOneOrCreate(message.guild.id);
		guildConfig.prefix = prefix;
		this.guildConfig.save(guildConfig);

		return message.channel.send("Prefix updated");
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
