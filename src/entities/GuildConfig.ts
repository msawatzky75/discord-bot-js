import {Snowflake} from "discord.js";
import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

// Snowflakes are 64-bit numbers, handled as strings
@Entity()
export class GuildConfig extends BaseEntity {
	@PrimaryColumn({type: "character", length: 64})
	guildId: Snowflake;

	@Column({type: "character", length: 64, nullable: true})
	adminRole: Snowflake;

	@Column({type: "varchar", nullable: true})
	prefix: string;
}
