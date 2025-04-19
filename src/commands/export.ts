import debug from "debug";
import {ChatInputCommandInteraction, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import type {Command} from "./index";
import util from "../util.js";
import {getMessages} from "../helpers/messages.js";
import {Canvas} from "skia-canvas";
import moment from "moment";
import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	TimeScale,
	TimeSeriesScale,
	Legend,
	Title,
} from "chart.js";

const d = debug("bot.commands.export");
const dv = debug("verbose.bot.commands.export");

Chart.register([
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	TimeScale,
	TimeSeriesScale,
	Legend,
	Title,
]);

const ExportTypes = {
	csv: "csv",
	json: "json",
	chart: "chart",
};

const colors = [
	"hsl(0, 48.10%, 52.40%)",
	"hsl(60, 48.10%, 52.40%)",
	"hsl(120, 48.10%, 52.40%)",
	"hsl(180, 48.10%, 52.40%)",
	"hsl(240, 48.10%, 52.40%)",
	"hsl(300, 48.10%, 52.40%)",

	"hsl(20, 48.10%, 52.40%)",
	"hsl(80, 48.10%, 52.40%)",
	"hsl(140, 48.10%, 52.40%)",
	"hsl(200, 48.10%, 52.40%)",
	"hsl(260, 48.10%, 52.40%)",
	"hsl(320, 48.10%, 52.40%)",

	"hsl(40, 48.10%, 52.40%)",
	"hsl(100, 48.10%, 52.40%)",
	"hsl(160, 48.10%, 52.40%)",
	"hsl(220, 48.10%, 52.40%)",
	"hsl(280, 48.10%, 52.40%)",
	"hsl(340, 48.10%, 52.40%)",
];

type QuoteData = {
	message: string;
	quoteDate: moment.Moment;
	quoter: string;
	quoted: string;
};

const command: Command = {
	data: new SlashCommandBuilder()
		.addStringOption((b) =>
			b
				.setName("type")
				.setChoices([
					{name: ExportTypes.csv, value: ExportTypes.csv},
					{name: ExportTypes.json, value: ExportTypes.json},
					{name: ExportTypes.chart, value: ExportTypes.chart},
				])
				.setRequired(true)
				.setDescription("export data type"),
		)
		.addStringOption((b) =>
			b
				.setName("timeframe")
				.setDescription("Timeframe of quotes to visualize. Default: P30D (ISO8601 Time Interval)")
				.setRequired(false),
		)
		.addNumberOption((b) => b.setName("top").setDescription("Reduces result to the top N quoted").setRequired(false))
		.setName("export")
		.setDescription("Export data from the quotes channel"),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const quoteChannel = interaction.guild.channels.cache.find((c) => {
			if (!(c instanceof TextChannel)) return false;
			return c.topic?.includes("#quotes");
		});
		if (!(quoteChannel instanceof TextChannel)) throw new Error("Could not find quote channel");

		const type = interaction.options.getString("type");
		const timeframe = moment.duration(interaction.options.getString("timeframe") ?? "P30D");
		const top = interaction.options.getNumber("top") ?? 5;
		d(
			`Executing 'export' with config '${toJson({
				type,
				timeframe,
				top,
			})}'`,
		);

		const messages = await getMessages(quoteChannel);

		const startTime = moment().subtract(timeframe.clone());
		moment.relativeTimeRounding(Math.floor);

		const formattedData: QuoteData[] = messages
			.filter((x) => moment(x.createdAt).isSameOrAfter(startTime))
			.map((x) => {
				return {
					message: getQuote(x),
					quoteDate: moment(x.createdAt).startOf("day"),
					quoter: x.author.username.trim(),
					quoted: getQuoted(x),
				};
			});
		d("Successfully formatted data");

		// await util.sendReply(interaction, `Type: ${type}\n`);
		switch (type) {
			case ExportTypes.csv:
				d("Exporting CSV");
				await util.sendReply(interaction, {
					files: [
						{
							attachment: Buffer.from(toCsv(formattedData), "utf-8"),
							name: "export.csv",
						},
					],
				});
				break;
			case ExportTypes.json:
				d("Exporting JSON");
				await util.sendReply(interaction, {
					files: [
						{
							attachment: Buffer.from(toJson(formattedData), "utf-8"),
							name: "export.json",
						},
					],
				});
				break;
			case ExportTypes.chart:
				d("Exporting chart");
				await util.sendReply(interaction, {
					files: [
						{
							attachment: await createChart(formattedData, startTime.clone(), timeframe.clone(), top),
							name: "chart.png",
						},
					],
				});
				break;
		}
	},
};

function getQuote(message: Message) {
	const content = message.content
		.replace(/<@!?(\d+)>/g, (match) => {
			const id = match.replace(/<@!?/, "").replace(/>/, "");
			const member = message.mentions.users.get(id);
			return `**${member.username.trim()}**`;
		})
		.replace(/"/g, "")
		.trim();
	const quotedStart = content.lastIndexOf(" - ");

	return content.substring(0, quotedStart);
}

function getQuoted(message: Message) {
	const quotedStart = message.content.lastIndexOf(" - ");
	const quoted = message.content.substring(quotedStart + 3);

	return quoted.replace(/<@!?(\d+)>/g, (match) => {
		const id = match.replace(/<@!?/, "").replace(/>/, "");
		const member = message.mentions.users.get(id);
		return `${member.username.trim()}`;
	});
}

function toJson(data: object) {
	return JSON.stringify(data, null, "\t");
}

function toCsv(data: QuoteData[]) {
	const csvData = [
		["message", "quoteDate", "quoter", "quoted"],
		...data.map((x) => [commaEscape(x.message), x.quoteDate, x.quoter, x.quoted]),
	];

	return csvData
		.map((items) => {
			return items.reduce((prev, curr) => {
				const item = curr instanceof moment ? curr.toISOString() : curr;

				return `${prev},${item}`;
			});
		})
		.join("\n");
}

function commaEscape(line: string) {
	if (line.includes(",")) {
		return `"${line}"`;
	}
	return line;
}

function createChartData(data: QuoteData[]) {
	type ChartDataPoint = string;
	const distinctQuoted = Array.from(new Set(data.map((x) => x.quoted)));

	dv(`distinct quoted: ${toJson(distinctQuoted)}`);

	const outputData = distinctQuoted.reduce(
		(prev, curr) => [...prev, [curr, []] as [string, ChartDataPoint[]]],
		[] as [string, ChartDataPoint[]][],
	);

	return outputData.map(([user, datapoints]) => {
		const sourceData = data.filter((y) => y.quoted === user);
		datapoints = sourceData.reduce((prev, curr) => {
			prev.push(curr.quoteDate.format("yyyy-MM-DD"));
			return prev;
		}, [] as ChartDataPoint[]);
		return [user, datapoints] as [string, ChartDataPoint[]];
	});
}

function createChart(data: QuoteData[], startTime: moment.Moment, duration: moment.Duration, top: number) {
	dv(`creating chart with config: ${toJson({data, startTime, duration, top})}`);

	const chartData: [string, [string, number][]][] = createChartData(data)
		.map(
			([label, data]) =>
				[
					label,
					data
						.sort((a, b) => a[0].localeCompare(b[0]))
						.reverse()
						.map((x, i) => [x, i]),
				] as [string, [string, number][]],
		)
		.sort((a, b) => a[1][0][0].localeCompare(b[1][0][0]))
		.slice(0, top);
	chartData.forEach((x) => dv(`${x[0]}: ${toJson(x[1])}`));

	const canvas = new Canvas(800, 400);

	const minimum: moment.Moment = chartData.reduce(
		(prev, curr) => (prev.unix() > moment(curr[1][0][0]).unix() ? moment(curr[1][0][0]) : prev),
		// just something really big that won't show up in the data
		moment("3000-01-01"),
	);
	const maximum: moment.Moment = chartData.reduce(
		(prev, curr) =>
			prev.unix() < moment(curr[1][curr[1].length - 1][0]).unix() ? moment(curr[1][curr[1].length - 1][0]) : prev,
		// just something really small that won't show up in the data
		moment("1000-01-01"),
	);
	dv(`times: ${toJson({minimum, maximum})}`);

	const labels = util.daysBetween(minimum, maximum).map((x) => x.format("yyyy-MM-DD"));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new Chart(canvas as any, {
		data: {
			datasets: [
				...chartData.map(([label, data], i) => ({
					type: "line" as const,
					label,
					data,
					pointBorderColor: colors[i],
					borderColor: colors[i],
					yAxisID: "y",
					stepped: true,
				})),
			],

			labels,
		},
		options: {
			scales: {
				y: {type: "linear", axis: "y"},
				// x: {type: "linear", axis: "x"},
			},
			plugins: {
				title: {
					display: true,
					text: "Quote frequency per person",
				},
			},
		},
	});

	return canvas.toBuffer("png", {matte: "white"});
}

export default command;
