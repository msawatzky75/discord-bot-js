import debug from "debug";
import commands from "./commands/index.js";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const d = debug("bot.register-commands");

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

rest
	.put(Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD), {
		body: commands.map((c) => c.data.toJSON()),
	})
	.then((data: any[]) => console.log(`Successfully registered ${data.length} application commands.`), d);
