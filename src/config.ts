import {Snowflake} from "discord.js";
import Package from "../package.json" with {type: "json"};
import dotenv from "dotenv";
import debug from "debug";

dotenv.config();
const d = debug("bot.config");

const config = {
	Version: Package.version,
	Token: process.env.TOKEN,
	Client: process.env.CLIENT,
	RoleStealer: {
		Roles: (process.env.STEALABLE_ROLES || "").split(/,|\s/) as Snowflake[],
		Delete: Boolean(process.env.ROLE_STEALER_DELETE && JSON.parse(process.env.ROLE_STEALER_DELETE)),
		Confirmation: Boolean(process.env.ROLE_STEALER_CONFIRMATION && JSON.parse(process.env.ROLE_STEALER_CONFIRMATION)),
	},
};

d("Config Loaded:");
d(JSON.stringify({...config, Token: "REDACTED"}, null, "\t"));

export default config;
