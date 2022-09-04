import debug from "debug";
import {Collection, Message, Snowflake, GuildMember, Role} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const d = debug("bot.services.role-stealer");
const dv = debug("verbose.bot.services.role-stealer");

const StealableRoles: string[] = [...(process.env.STEALABLE_ROLES || "").split(",")].filter(Boolean);

export default async function RoleStealer(message: Message) {
	if (!message.inGuild()) return;
	if (!message.member) return;
	if (message.mentions.roles.size === 0) return;

	const roles: Collection<Snowflake, Role> = message.mentions.roles.filter((role) =>
		StealableRoles.includes(role.id),
	);
	if (roles.size === 0) return;

	dv(`Stealing roles ${roles.map((r) => r.name)}`);

	// remove the role from anyone who has the role and give it to the message author
	const victims = roles.reduce((acc, role) => {
		// if a member already has the role, add them to the list of victims
		if (acc.find((m) => m.roles.cache.has(role.id))) return acc;

		const members = role.members;
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
	message.channel.send(
		`${message.author} has stolen the ${roles.map((role) => role.name).join(", ")} role(s) from ${
			victims.size
		} user(s)`,
	);
}
