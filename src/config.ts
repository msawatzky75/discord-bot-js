import {Snowflake} from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const config = {
	Token: process.env.TOKEN,
	Client: process.env.CLIENT,
	Guild: process.env.GUILD as Snowflake,
	QuoteChannel: (process.env.QUOTE_CHANNEL || "").split(/,|\s/) as Snowflake[],
	RoleStealer: {
		Roles: (process.env.STEALABLE_ROLES || "").split(/,|\s/) as Snowflake[],
		Delete: Boolean(process.env.ROLE_STEALER_DELETE && JSON.parse(process.env.ROLE_STEALER_DELETE)),
		Confirmation: Boolean(
			process.env.ROLE_STEALER_CONFIRMATION && JSON.parse(process.env.ROLE_STEALER_CONFIRMATION),
		),
	},
};

export default config;
