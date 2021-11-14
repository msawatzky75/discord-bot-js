import debug from "debug";
import {injectable} from "inversify";

@injectable()
export class Logger {
	private _log(message: string, scope?: string): void {
		const _message = `${new Date().toISOString()} - ${message}`;

		if (scope) {
			debug(`bot.${scope}`)(_message);
		} else {
			debug("bot")(_message);
		}
	}

	public verbose(message: string): void {
		this._log(message, "verbose");
	}

	public log(message: string): void {
		this._log(message, "info");
	}

	public error(error: string): void {
		this._log(error, "error");
	}

	public debug(message: string): void {
		this._log(message, "debug");
	}
}
