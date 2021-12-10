import {Collection, Snowflake, Message, Role, GuildMember} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";

@injectable()
export class RoleStealer {
	@inject(TYPES.StealableRoles) private roles: Snowflake[];

	constructor(@inject(TYPES.Logger) private logger: Logger) {
		this.logger.context = "service.RoleStealer";
	}

	containsRole(message: Message): Collection<Snowflake, Role> {
		// return collection of the roles configured to be stealable
		return message.mentions.roles.filter((role) => this.roles.includes(role.id));
	}

	handle(message: Message): Promise<Message | Message[]> {
		const roles = this.containsRole(message);

		if (roles.size === 0) {
			this.logger.verbose("No stealable roles mentioned");
			return Promise.reject();
		}

		if (!message.guild) {
			// this shouldn't happen, but just in case
			this.logger.verbose("Message is not from a guild");
			return Promise.reject();
		}

		this.logger.verbose(`Stealing roles ${roles.map((r) => r.name)}`);

		// remove the role from anyone who has the role and give it to the message author
		const victims = roles.reduce((acc, role) => {
			// if a member already has the role, add them to the list of victims
			if (acc.find((m) => m.roles.cache.has(role.id))) return acc;

			const members = message.guild.roles.cache.get(role.id).members;
			members.forEach((m) => acc.set(m.id, m));
			return acc;
		}, new Collection<Snowflake, GuildMember>());

		// remove the roles from the victims
		victims.forEach((member) => {
			member.roles.remove(roles);
		});

		// give the roles to the message author
		message.member.roles.add(roles);

		// remove the message that invoked the command
		if (message.deletable) {
			message.delete();
		}

		// send a message to the channel that invoked the command indicating the roles were stolen
		return message.channel.send(
			`${message.author} has stolen the ${roles.map((role) => role.name).join(", ")} role(s) from ${
				victims.size
			} user(s)`,
		);
	}
}
