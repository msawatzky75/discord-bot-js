# Marty Bot

## Setup

Requirements: [Yarn](https://yarnpkg.com/lang/en/docs/install/), Node (v16)
OR [Docker](https://docs.docker.com/get-docker/), [Docker Compose](https://docs.docker.com/compose/install/)

This project uses [zero-install yarn](https://yarnpkg.com/features/zero-installs), meaning you do
not have to run a separate install step. All the dependancies are already there.

1. Clone this repository.

1. Create your environment by copying the [.env.default](.env.default) file to `.env`
   and add your token and configuraton

   ```
   $ cp .env.default .env
   ```

1. Build the bot using this command:

   ```
   $ yarn build
   ```

1. You're done! You can run the bot with

   ```
   $ yarn start
   ```

## Development

There are some commands to help you develop the bot:

1. To rebuild the bot every time you save a file:

   ```
   $ yarn watch
   ```

1. To start the development server, and restart it every time you save a file:

   ```
   $ yarn dev
   ```

## Code Structure

The only thing this bot can do is run a service for each message that gets sent.
These are defined in the [services](src/services) folder.
But this does not mean the bot handle commands.

The [CommandHandler](src/services/CommandHandler) is the command service, which watches for command-like messages. See [commands](src/commands/README.md) for the commands that are available and how to structure new ones.

## Dependency Injection

All configuration is done through dependency injection.

Define your dependencies in [inversify.config.ts](inversify.config.ts) file, and inject your dependencies into where you need them.
