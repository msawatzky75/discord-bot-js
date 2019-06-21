Marty Bot
=========

## Getting Started

Marty bot is built into docker containers and can be found at [Docker Hub](https://cloud.docker.com/repository/docker/msawatzky75/discord-bot-js).

### Installation
1. Clone this repository.
1. Install NodeJS.
1. [Install Yarn.](https://yarnpkg.com/lang/en/docs/install/)
1. Install Docker. (optional, see below)
1. Install Docker Compose. (optional, see below)
1. Copy and rename the [.env.default](.env.default) file to `.env` and add your bot token.
1. Run `yarn install` in the project folder.

Note: Docker is optional, but you will need to setup your own postgres server with a database that matches your connection string (configured in [.env](.env)).
That being said, using Docker is the easiest approach, though not ideal for development.

### Running the Bot
1. Run `docker-compose up` in the project folder.

#### OR
1. Start your postgres database, with credentials that match the [.env](.env.default) file
1. Run `yarn db` (only needed the first time you run).
1. Run `yarn dev` or `yarn start` to start the bot.

### Available Commands
- `yarn build` will build and bundle the typescript into js in `dist/bundle.js` file.
- `yarn dev` will run a development version that will restart on file changes.
- `yarn lint` will lint the code without making changes.
- `yarn start` will run a production version of the bot.
- `yarn test` will run the test suite.

### Code Structure
Every command must export a function as an interface for the command. Available arguments are the message object, the user object, and an array of arguments from the message.

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
