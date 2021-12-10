import {Message} from "discord.js";
import {injectable} from "inversify";
import {GuildConfig} from "../entities/GuildConfig";
import {Command} from "./Command";
import {ICommand} from "./ICommand";

@injectable()
export class Config extends Command implements ICommand {
	public name = "config";
	public description = "Configures the bot for the server";
	public aliases: string[] = [];
	public usage = "config <option> <value>";
	public adminOnly = true;

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
				case "admin":
					return this.setAdmin(message);
				default:
					return message.channel.send(`Unknown option ${option}`);
			}
		}
		return Promise.reject("No arguments provided");
	}

	private async setAdmin(message: Message) {
		if (message.mentions.roles.size === 0) {
			return message.channel.send("No role provided");
		}
		const guildConfig = await GuildConfig.findOneOrCreate(message.guild.id);
		guildConfig.adminRole = message.mentions.roles.first().id;
		guildConfig.save();

		return message.channel.send("Admin role updated");
	}

	private async setPrefix(message: Message, prefix: string) {
		if (prefix.length > 1) {
			return message.channel.send("Prefix must be one character");
		}

		const guildConfig = await GuildConfig.findOneOrCreate(message.guild.id);
		guildConfig.prefix = prefix;
		guildConfig.save();

		return message.channel.send("Prefix updated");
	}
}
