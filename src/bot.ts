import "reflect-metadata";
import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {Logger} from "./logger";
import {RoleStealer} from "./services/RoleStealer";
import {CommandHandler} from "./services/CommandHandler";
@injectable()
export class Bot {
	@inject(TYPES.Client) private client: Client;
	@inject(TYPES.Token) private token: string;
	@inject(TYPES.Logger) private logger: Logger;
	// services
	@inject(TYPES.RoleStealer) private roleStealer: RoleStealer;
	@inject(TYPES.CommandHandler) private commandHandler: CommandHandler;

	listen() {
		this.client.on("messageCreate", (message: Message) => {
			if (message.author.bot) {
				this.logger.verbose("Ignoring bot message");
				return;
			}
			this.logger.verbose(`Handling message: ${message.content}`);

			this.commandHandler
				.handle(message)
				.then(() => {
					this.logger.verbose(`Handled message: ${message.content}`);
				})
				.catch((e?: string) => {
					if (e) {
						this.logger.error(e);
					}
				});

			this.roleStealer
				.handle(message)
				.then(() => {
					this.logger.verbose("Message handled");
				})
				.catch((e?: string) => {
					if (e) {
						this.logger.error(e);
					}
				});
		});

		this.client.on("ready", () => {
			this.logger.log(`Logged in as ${this.client.user.tag}!`);
		});

		return this.client.login(this.token);
	}
}
