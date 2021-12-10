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

	public static async findOneOrCreate(guildId: string) {
		const config = await this.findOne({guildId});
		if (config) {
			return config;
		}
		const newConfig = new this();
		newConfig.guildId = guildId;
		await this.save(newConfig);
		return newConfig;
	}
}
