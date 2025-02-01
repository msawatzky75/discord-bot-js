import debug from "debug";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import type {Command} from "./index";
import util from "../util.js";

const d = debug("bot.commands.roll");

const command: Command = {
	data: new SlashCommandBuilder()
		.addNumberOption((b) =>
			b.setName("dice").setMinValue(1).setMaxValue(100).setRequired(false).setDescription("Number of dice to roll"),
		)
		.addNumberOption((b) =>
			b
				.setName("outcomes")
				.setMinValue(2)
				.setMaxValue(100_000)
				.setRequired(false)
				.setDescription("Number of possible outcomes"),
		)
		.setName("roll")
		.setDescription("Roll one or more dice."),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const dice = interaction.options.getNumber("dice") ?? 1;
		const outcomes = interaction.options.getNumber("outcomes") ?? 20;
		const allOutcomes: number[] = [];

		for (let i = 0; i < dice; i++) {
			allOutcomes.push(Math.floor(Math.random() * outcomes) + 1);
		}

		await util.sendReply(interaction, `Rolling ${dice}d${outcomes}: ` + allOutcomes.join(", "));
	},
};

export default command;
