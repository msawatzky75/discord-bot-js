Marty Bot
=========

## Getting Started

### Installation
1. Clone this repository.
1. Install NodeJS.
1. [Install Yarn.](https://yarnpkg.com/lang/en/docs/install/)
1. Install Docker.
1. Install Docker Compose.
1. Copy and rename the [.env.default](.env.default) file to `.env` and add your bot token.
1. Run `yarn install` in the project folder.

Note: Docker is optional, but you will need to setup your own postgres server with a database that matches your connection string (configured in [.env](.env))

### Running the Bot
1. Run `docker-compose up` in the project folder.
1. Run `yarn db` (only needed the first time you run).
1. Run `yarn dev` or `yarn start` to start the bot.

### Availbale Commands
- `yarn build` will build the typescript into js in the [build](build/) folder.
- `yarn dev` will run a development version that will restart on file changes.
- `yarn start` will build and run a production version of the bot.
- `yarn test` will run the test suite.

### Code Structure
Every comamnd must export a function as an interface for the command. Available arguments are the messgae object, the user object, and an array of arguments from the message.

Each command should be exported from the [index](commands/index.ts) in the commands folder. Anything else needed will be referenced directly to the file.
Each command file should also export a `help` method that returns a RichEmbed object detailing usage for the user to see.


## Bot Commands

### Config
Used to configure settings as needed.

Usage: `!config [action] [property] [value]`


#### Actions
- Set - used to set a new property.
- Update - used to update an existing property.
- Remove - used to unset a property.

#### Properties

##### timezone
Used by the `remind` command to inform you of the correct time it will remind you. For a list of available values, refer to [moment-timezone](https://momentjs.com/timezone/docs/)

##### welcomechannel
Not yet complete.


### Help
Not yet complete.

<!-- Used to list the help for a command.

Usage: `!help [command name]` -->


### Nickname
Not yet complete.


### Remind
Used to remind a user of something at the time specified.
After a reminder has been set, Marty will message the user of the time and message immediately and at the requested time.

Usage: `!remind 1 hour cook dinner`


### Sarcasm
Capitalizes every other letter of text provided.
