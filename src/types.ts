export const TYPES = {
	Bot: Symbol("Bot"),
	DatabaseProvider: Symbol("DatabaseProvider"),
	Client: Symbol("Client"),
	Token: Symbol("Token"),
	Logger: Symbol("Logger"),

	// Services
	RoleStealer: Symbol("RoleStealer"),
	StealableRoles: Symbol("StealableRoles"),

	// Commands
	CommandHandler: Symbol("CommandHandler"),
	Commands: Symbol("Commands"),
	Prefix: Symbol("Prefix"),
	CommandChannelWhitelist: Symbol("CommandChannelWhitelist"),

	// Delete command options
	DeleteConfirmation: Symbol("DeleteConfirmation"),

	// Quote command options
	QuoteChannel: Symbol("QuoteChannel"),

	GuildConfig: Symbol("GuildConfig"),
};
