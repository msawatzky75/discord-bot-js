import dotenv from "dotenv";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {Client, Intents} from "discord.js";
import {RoleStealer} from "./services/RoleStealer";
import {Logger} from "./logger";

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
container.bind<RoleStealer>(TYPES.RoleStealer).to(RoleStealer).inSingletonScope();
container.bind<string[]>(TYPES.StealableRoles).toConstantValue(process.env.STEALABLE_ROLES.split(","));

export default container;
