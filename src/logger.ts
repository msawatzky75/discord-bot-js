import debug from "debug";
import {injectable} from "inversify";

debug.enable(
	process.argv.reduce((scope, arg) => {
		if (arg.startsWith("--debug=")) {
			return arg.split("=")[1];
		}
		return scope;
	}, "bot.info"),
);

@injectable()
export class Logger {
	public context: string;

	private _log(message: string | number | boolean, scope?: string): void {
		const _message = `${new Date().toISOString()} - ${message}`;

		if (scope) {
			debug(`bot.${[scope, this.context].filter(Boolean).join(".")}`)(_message);
		} else {
			debug("bot")(_message);
		}
	}

	public verbose(message: string | number | boolean): void {
		this._log(message, "verbose");
	}

	public log(message: string | number | boolean): void {
		this._log(message, "info");
	}

	public error(error: Error): void {
		this._log(error.toString(), "error");
		this._log(error.stack, "error.stack");
	}

	public debug(message: string | number | boolean): void {
		this._log(message, "debug");
	}
}
