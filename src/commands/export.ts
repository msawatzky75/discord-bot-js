import debug from "debug";
import {ChatInputCommandInteraction, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import type {Command} from "./index";
import util from "../util.js";
import {getMessages} from "../helpers/messages.js";
import {Canvas} from "skia-canvas";
import moment, {max} from "moment";
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
				.setRequired(false)
				.setDescription("Timeframe of quotes to visualize. Default: P30D (ISO8601 Time Interval)"),
		)
		.addStringOption((b) =>
			b
				.setName("timegroup")
				.setRequired(false)
				.setDescription("Segments of time to view on x axis. Default: P1D (ISO8601 Time Interval)"),
		)
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
		const timegroup = moment.duration(interaction.options.getString("timegroup") ?? "P1D");
		const messages = await getMessages(quoteChannel);

		const startTime = moment().subtract(timeframe);
		moment.relativeTimeRounding(Math.floor);

		const formattedData: QuoteData[] = messages
			.filter((x) => moment(x.createdAt).isSameOrAfter(startTime))
			.map((x) => {
				return {
					message: getQuote(x),
					quoteDate: roundDate(x.createdAt, timegroup, Math.floor),
					quoter: x.author.username.trim(),
					quoted: getQuoted(x),
				};
			});

		await util.sendReply(interaction, `Type: ${type}\n`);
		switch (type) {
			case ExportTypes.csv:
				await util.sendReply(interaction, `\`\`\`${toCsv(formattedData)}\`\`\``);
				break;
			case ExportTypes.json:
				await util.sendReply(interaction, `\`\`\`${toJson(formattedData)}\`\`\``);
				break;
			case ExportTypes.chart:
				// TODO: figure out data grouping
				// TODO: figure out data filtering
				await util.sendReply(interaction, {files: [{attachment: await createChart(formattedData), name: "chart.png"}]});
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

function toJson(data: QuoteData[]) {
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
				const item = curr instanceof Date ? curr.toISOString() : curr;

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

function roundDate(date: Date, duration: moment.Duration, roundMethod: (x: number) => number = Math.round) {
	const outputDate = moment(date);
	const years = Math.trunc(duration.asYears());
	const months = Math.trunc(duration.asMonths());
	const days = Math.trunc(duration.asDays());
	const hours = Math.trunc(duration.asHours());

	if (years > 0) {
		d(`Rounding years. (${duration.humanize()})`);
		const i = years;
		const val = outputDate
			.year(roundMethod(outputDate.year() / i) * i)
			.month(0)
			.date(1)
			.hour(0)
			.minute(0)
			.second(0);
		d(`o: ${moment(date).format("yyyy-MM-DD")}, r: ${val.format("yyyy-MM-DD")}`);
		return val;
	}
	if (months > 0) {
		d(`Rounding months. (${duration.humanize()})`);
		const i = months;
		return outputDate
			.month(roundMethod(outputDate.month() / i) * i)
			.date(1)
			.hour(0)
			.minute(0)
			.second(0);
	}
	if (days > 0) {
		d(`Rounding days. (${duration.humanize()})`);
		const i = days;
		return outputDate
			.date(roundMethod(outputDate.day() / i) * i)
			.hour(0)
			.minute(0)
			.second(0);
	}
	if (hours > 0) {
		d(`Rounding hours. (${duration.humanize()})`);
		const i = hours;
		return outputDate
			.hour(roundMethod(outputDate.hour() / i) * i)
			.minute(0)
			.second(0);
	}
	d(`did not round date. (${duration.humanize()})`);
	return outputDate;
}

function createChartData(data: QuoteData[]) {
	type ChartDataPoint = string;
	const distinctQuoted = Array.from(new Set(data.map((x) => x.quoted)));

	const outputData = distinctQuoted.reduce(
		(prev, curr) => [...prev, [curr, []] as [string, ChartDataPoint[]]],
		[] as [string, ChartDataPoint[]][],
	);

	return outputData.map(([user, datapoints]) => {
		const sourceData = data.filter((y) => y.quoted === user);
		datapoints = sourceData.reduce((prev, curr) => {
			prev.push(
				curr.quoteDate.format("yyyy-MM-DD"), //.toLocaleDateString(undefined, {year: "numeric", month: "numeric", day: "numeric"}),
			);
			return prev;
		}, [] as ChartDataPoint[]);
		return [user, datapoints] as [string, ChartDataPoint[]];
	});
}

function createChart(data: QuoteData[]) {
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
		.sort((a, b) => a[1][0][0].localeCompare(b[1][0][0]));

	const minimum: string = chartData.reduce(
		(prev, curr) => (prev.localeCompare(curr[1][0][0]) > 0 ? curr[1][0][0] : prev),
		"9999-99-99",
	);

	const maximum: string = chartData.reduce(
		(prev, curr) => (prev.localeCompare(curr[1][0][0]) < 0 ? curr[1][0][0] : prev),
		"0000-00-00",
	);

	d(`Min: ${minimum}`);
	d(`Max: ${maximum}`);
	d(JSON.stringify(chartData, null, "\t"));
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

	const canvas = new Canvas(800, 400);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new Chart(canvas as any, {
		data: {
			datasets: [
				...chartData.map(([label, data], i) => ({
					type: "line" as const,
					label,
					data: data,
					pointBorderColor: colors[i],
					borderColor: colors[i],
					yAxisID: "y",
					stepped: true,
				})),
			],

			labels: util.daysBetween(new Date(minimum), new Date(maximum)).map((x) =>
				x.toLocaleDateString(undefined, {
					year: "numeric",
					month: "numeric",
					day: "numeric",
				}),
			),
			// labels: util.getDaysOfMonth(new Date()),
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
