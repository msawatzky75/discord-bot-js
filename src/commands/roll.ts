import debug from "debug";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import type {Command} from "./index";

const d = debug("bot.commands.roll");

const command: Command = {
	data: new SlashCommandBuilder()
		.addNumberOption((b) =>
			b
				.setName("dice")
				.setMinValue(0)
				.setMaxValue(100)
				.setRequired(true)
				.setDescription("Number of dice to roll"),
		)
		.addNumberOption((b) =>
			b
				.setName("outcomes")
				.setMinValue(2)
				.setMaxValue(100_000)
				.setRequired(true)
				.setDescription("Number of possible outcomes"),
		)
		.setName("roll")
		.setDescription("Roll one or more dice."),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const dice = interaction.options.getNumber("dice") ?? 0;
		const outcomes = interaction.options.getNumber("outcomes") ?? 2;
		const allOutcomes: number[] = [];

		for (let i = 0; i < dice; i++) {
			allOutcomes.push(Math.floor(Math.random() * outcomes) + 1);
		}

		await interaction.reply(`Rolling ${dice}d${outcomes}: ` + allOutcomes.join(", "));
	},
};

export default command;
