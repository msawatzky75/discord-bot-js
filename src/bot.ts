import "reflect-metadata";
import {Client, GuildMember, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {debug} from "debug";
import {Logger} from "./logger";
import {MessageResponder} from "./services/MessageResponeder";

const d = debug("bot");

@injectable()
export class Bot {
	private client: Client;
	private token: string;
	private logger: Logger;
	private messageResponder: MessageResponder;

	constructor(
		@inject(TYPES.Client) client: Client,
		@inject(TYPES.Token) token: string,
		@inject(TYPES.MessageResponder) messageResponder: MessageResponder,
		@inject(TYPES.Logger) logger: Logger,
	) {
		this.client = client;
		this.token = token;
		this.logger = logger;
		this.messageResponder = messageResponder;
	}

	listen(): Promise<string> {
		this.client.on("messageCreate", (message: Message) => {
			if (message.author.bot) {
				this.logger.log("Ignoring bot message");
				return;
			}
			this.logger.log(`Handling message: ${message.content}`);

			this.messageResponder.handle(message).then(() => {
				this.logger.log("Message handled");
			}).catch(() => {
				this.logger.error(new Error("Message not handled"));
			});
		});

		this.client.on("ready", () => {
			this.logger.log(`Logged in as ${this.client.user.tag}!`);
		});
		return this.client.login(this.token);
	}
}
