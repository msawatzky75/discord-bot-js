import {Collection, Snowflake, Message, Role} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";

@injectable()
export class RoleStealer {
	private roles: Snowflake[];

	constructor(@inject(TYPES.StealableRoles) roles: Snowflake[]) {
		this.roles = roles;
	}

	containsRole(message: Message): Collection<Snowflake, Role> {
		// return collection of the roles configured to be stealable
		return message.mentions.roles.filter((role, key) => this.roles.includes(role.id));
	}

	handle(message: Message): Promise<Message | Message[]> {
		const roles = this.containsRole(message);
		if (this.roles.length > 0 && message.guild) {
			// remove the role from anyone who has the role and give it to the message author
			const vicitms = message.guild.members.cache.filter((member) =>
				member.roles.cache.hasAny(...roles.map((role) => role.id)),
			);

			vicitms.forEach((member) => {
				member.roles.remove(roles);
			});
			message.member.roles.add(roles);
			if (message.deletable) {
				message.delete();
			}
			return message.channel.send(
				`${message.author} has stolen the ${roles.map((role) => role.name).join(", ")} role(s) from ${
					vicitms.size
				} user(s)`,
			);
		}

		return Promise.reject();
	}
}
