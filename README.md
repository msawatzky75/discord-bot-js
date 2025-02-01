# Marty Bot

[![Marty Latest](https://github.com/msawatzky75/discord-bot-js/actions/workflows/latest.yml/badge.svg?branch=master)](https://github.com/msawatzky75/discord-bot-js/actions/workflows/latest.yml)
[![Marty Nightly](https://github.com/msawatzky75/discord-bot-js/actions/workflows/nightly.yml/badge.svg?branch=dev)](https://github.com/msawatzky75/discord-bot-js/actions/workflows/nightly.yml)

## Setup

1. Clone this repository.

1. Create your environment by copying the [.env.default](.env.default) file to `.env`
   and add your token and configuraton

   ```
   $ cp .env.default .env
   ```

1. Install package dependencies:

   ```
   $ npm install
   ```

1. Build the bot using:

   ```
   $ npm run build
   ```

1. You're done! You can now run the bot:

   ```
   $ npm run start
   ```

### Using Docker

If you choose to use docker to run the bot, you can use the following commands:

```
$ docker compose up --build
```

or if you dont want to use docker compose:

```
$ docker build . --tag marty-bot:latest
$ docker run marty-bot:latest
```

## Development

There are some commands to help you develop the bot:

1. To rebuild the bot every time you save a file:

   ```
   $ npm run watch
   ```

1. To start the development server, and restart it every time you save a file:

   ```
   $ npm run dev
   ```

## First Time Setup

In order for the slash commands to work, they need to be registered before
the bot can process them. This is done automatically when the `AUTO_REGISTER` environment
variable is set to `true`.
