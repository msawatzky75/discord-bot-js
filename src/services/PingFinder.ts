import { injectable } from "inversify";

@injectable()
export class PingFinder {
	private regex = /ping/;

	public isPing(message: string): boolean {
		return this.regex.test(message);
	}
}