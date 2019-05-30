import {ISubscribable} from '../types';
import {
	Collection,
	Snowflake,
	User,
} from 'discord.js';

export default class Remind implements ISubscribable {
	subscriptions: Collection<Snowflake, NodeJS.Timer>;

	subscribe(user: User, ...args): void {
		let waitTime: number = new Date(0, 0, 0, 1).getTime(); // 1 Hour

		this.subscriptions[user.id] = setInterval(() => {

		}, waitTime);
			console.log(`${user.tag} subscribed to ${args.join(' ')}`);
	}

	unSubscribe(user: User): void {
		clearInterval(this.subscriptions[user.id]);
		console.log(`${user.tag} unsubscribed.`);
	}
}
