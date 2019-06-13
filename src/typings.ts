import {
	Message,
	User,
} from 'discord.js';
import debug from 'debug';
const d = debug('src.typings');

export class Executable {
	static execute(msg: Message, args: string[]): void {
		d("Not yet implemented");
	}
}

export class Event {
	static execute(arg: any) {
		d("Not yet implemented");
	}
}

export class Subscribable {
	static subscribe(user: User, args: string[]): void {
		d("Not yet implemented");
	}
	static unSubscribe(user: User): void {
		d("Not yet implemented");
	}
}
