import dotenv from "dotenv";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client, Intents, Snowflake} from "discord.js";
import {RoleStealer} from "./services/RoleStealer";
import {Logger} from "./logger";
import {CommandHandler} from "./services/CommandHandler";
import {Sarcasm} from "./commands/Sarcasm";
import {ICommand} from "./commands/ICommand";
import {Delete} from "./commands/Delete";
import {Quote} from "./commands/Quote";

dotenv.config();
const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(
	new Client({
		intents: [
			Intents.FLAGS.DIRECT_MESSAGES,
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MEMBERS,
		],
	}),
);
container.bind<string>(TYPES.Token).toConstantValue(process.env.DISCORD_TOKEN);
container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();

// Services
container.bind<RoleStealer>(TYPES.RoleStealer).to(RoleStealer).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();

// Commands
container
	.bind<Snowflake[]>(TYPES.CommandChannelWhitelist)
	.toConstantValue(process.env.COMMAND_CHANNEL_WHITELIST.split(","));
container.bind<string>(TYPES.Prefix).toConstantValue(process.env.PREFIX);
container.bind<ICommand>(TYPES.Commands).to(Sarcasm);
// disabled for now
// container.bind<ICommand>(TYPES.Commands).to(Delete);
container.bind<ICommand>(TYPES.Commands).to(Quote);

// RoleStealer service options
container.bind<string[]>(TYPES.StealableRoles).toConstantValue(process.env.STEALABLE_ROLES.split(","));

// Delete command options
container
	.bind<number>(TYPES.DeleteConfirmation)
	.toConstantValue(parseInt(process.env.DELETE_CONFIRMATION, 10));

// Quote command options
container.bind<string>(TYPES.QuoteChannel).toConstantValue(process.env.QUOTE_CHANNEL);

export default container;
