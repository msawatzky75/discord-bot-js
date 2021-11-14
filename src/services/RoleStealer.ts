import {Collection, Snowflake, Message, Role} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";

@injectable()
export class RoleStealer {
	@inject(TYPES.StealableRoles) private roles: Snowflake[];
	@inject(TYPES.Logger) private logger: Logger;

	containsRole(message: Message): Collection<Snowflake, Role> {
		// return collection of the roles configured to be stealable
		return message.mentions.roles.filter((role) => this.roles.includes(role.id));
	}

	handle(message: Message): Promise<Message | Message[]> {
		const roles = this.containsRole(message);
		if (roles.size > 0 && message.guild) {
			this.logger.verbose(`Stealing roles ${roles.map((r) => r.name)}`);
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
		} else if (roles.size == 0) {
			this.logger.verbose("No stealable roles mentioned");
		} else if (!message.guild) {
			// this shouldn't happen, but just in case
			this.logger.verbose("Message is not from a guild");
		}

		return Promise.reject();
	}
}
