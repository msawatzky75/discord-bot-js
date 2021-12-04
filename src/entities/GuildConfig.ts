import {Snowflake} from "discord.js";
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class GuildConfig {
	@PrimaryColumn()
	guildId: Snowflake;

	@Column()
	adminRole: Snowflake;

	@Column()
	prefix: string;
}
