import {Collection, SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js";

// https://github.com/microsoft/TypeScript/issues/15479
import quote from "./quote.js";
import roll from "./roll.js";

export interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const rawCommands = [quote, roll];

const commands = new Collection<string, Command>();

for (const command of rawCommands) {
	commands.set(command.data.name, command);
}

export default commands;
