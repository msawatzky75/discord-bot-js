import {
	Message,
	User,
} from 'discord.js';

export interface IExecuteable {
	execute(msg: Message, args: string[]): void
}

export interface ISubscribable {
	subscribe(user: User, ...args: any): void
	unSubscribe(user: User): void
}
