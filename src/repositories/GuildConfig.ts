import {decorate, inject, injectable} from "inversify";
import {Connection, EntityRepository, Repository} from "typeorm";
import {GuildConfig} from "../entities/GuildConfig";
import {Logger} from "../logger";
import {TYPES} from "../types";

decorate(injectable(), Repository);

@EntityRepository(GuildConfig)
@injectable()
export class GuildConfigRepository extends Repository<GuildConfig> {
	@inject(TYPES.Logger) private logger: Logger;

	public constructor(@inject(TYPES.DatabaseProvider) private databaseProvider: () => Promise<Connection>) {
		super();
	}

	public async findOneOrCreate(guildId: string): Promise<GuildConfig> {
		const connection = await this.databaseProvider();

		const config = await connection.manager.findOne(GuildConfig, {guildId});
		if (config) {
			return config;
		}
		const newConfig = new GuildConfig();
		newConfig.guildId = guildId;
		await connection.manager.save(newConfig);
		return newConfig;
	}
}
