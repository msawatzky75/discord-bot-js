import {Snowflake} from "discord.js";
import {BaseEntity, Entity, PrimaryColumn} from "typeorm";

// Snowflakes are 64-bit numbers, handled as strings
@Entity()
export class GuildWhitelist extends BaseEntity {
	@PrimaryColumn({type: "character", length: 64})
	guildId: Snowflake;

	@PrimaryColumn({type: "character", length: 64})
	channelId: Snowflake;
}
