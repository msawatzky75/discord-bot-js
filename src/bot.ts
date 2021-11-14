import "reflect-metadata";
import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {Logger} from "./logger";
import {RoleStealer} from "./services/RoleStealer";
@injectable()
export class Bot {
	private client: Client;
	private token: string;
	private logger: Logger;
	private roleStealer: RoleStealer;

	constructor(
		@inject(TYPES.Client) client: Client,
		@inject(TYPES.Token) token: string,
		@inject(TYPES.RoleStealer) roleStealer: RoleStealer,
		@inject(TYPES.Logger) logger: Logger,
	) {
		this.client = client;
		this.token = token;
		this.logger = logger;
		this.roleStealer = roleStealer;
	}

	listen(): Promise<string> {
		this.client.on("messageCreate", (message: Message) => {
			if (message.author.bot) {
				this.logger.log("Ignoring bot message");
				return;
			}
			this.logger.log(`Handling message: ${message.content}`);

			this.roleStealer
				.handle(message)
				.then(() => {
					this.logger.log("Message handled");
				})
				.catch((e?: Error) => {
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
