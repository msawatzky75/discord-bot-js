import debug from "debug";
import commands from "./commands/index.js";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js";
import dotenv from "dotenv";

// eslint-disable no-console

dotenv.config();

const d = debug("bot.register-commands");

const requiredVars = ["TOKEN", "CLIENT", "GUILD"];
requiredVars.forEach((req) => {
	if (!process.env[req]) {
		console.log(`${req} is required`);
		process.exit(1);
	}
});

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

rest
	.put(Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD), {
		body: commands.map((c) => c.data.toJSON()),
	})
	.then((data) => console.log(`Successfully registered ${JSON.stringify(data, null, 2)}`), d);
