import {Message, Permissions, Snowflake} from "discord.js";
import {inject, injectable, multiInject} from "inversify";
import {TYPES} from "../types";
import {ICommand} from "../commands/ICommand";
import {Logger} from "../logger";
import {GuildConfig} from "../entities/GuildConfig";
import {GuildWhitelist} from "../entities/GuildWhitelist";

@injectable()
export class CommandHandler {
	@multiInject(TYPES.Commands) public commands: ICommand[];
	@inject(TYPES.Prefix) private prefix: string;

	constructor(@inject(TYPES.Logger) private logger: Logger) {
		this.logger.context = "service.CommandHandler";
	}

	async handle(message: Message): Promise<Message | Message[]> {
		if (!message.content.startsWith(this.prefix)) {
			// its just a normal message
			this.logger.verbose(`Message does not start with prefix: ${message.content}`);
			return Promise.reject();
		}

		// get guild's whitelested channels and admin role
		const [guildConfig, guildWhitelistedChannels] = await Promise.all([
			GuildConfig.findOne(message.guild.id),
			GuildWhitelist.find({guildId: message.guild.id}),
		]);

		const inWhitelistedChannel = guildWhitelistedChannels.some((c) => c.channelId === message.channel.id);

		if (message.content.startsWith(`${this.prefix}help`)) {
			return this.help(message);
		}

		const promises: Promise<Message | Message[]>[] = [];

		this.commands.forEach((command) => {
			// break if command cannot be handled
			if (!command.canHandle(message)) {
				return;
			}

			this.logger.debug(`Is Owner: ${message.author.id === message.guild.ownerId}`);

			// handle if author is server owner
			if (message.author.id === message.guild.ownerId) {
				return promises.push(command.handle(message));
			}

			// handle if author is admin
			if (
				message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
				message.member.roles.cache.has(guildConfig.adminRole)
			) {
				return promises.push(command.handle(message));
			}

			if (command.adminOnly) {
				this.logger.log(`${message.author.username} tried to use admin only command: ${command.name}`);
				return promises.push(Promise.reject());
			}

			if (!inWhitelistedChannel) {
				this.logger.verbose(`Message is not in a whitelisted channel: ${message.content}`);
				return promises.push(Promise.reject());
			}

			this.logger.log(`CommandHandler handling command: ${command.name}`);
			return promises.push(command.handle(message));
		});

		if (promises.length) {
			const messages = await Promise.all(promises);
			return messages.flat();
		}

		return Promise.reject("Command not found!");
	}

	private help(message: Message): Promise<Message | Message[]> {
		// list all commands
		return message.reply(`Available commands: ${this.commands.map((c) => c.name).join(", ")}`);
	}
}
