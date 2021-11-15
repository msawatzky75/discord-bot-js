# Commands

## Self-Contained

All of the logic for commands are self-contained in a single class. Each command impements the
[ICommand](ICommand.ts) interface. This ensures that types and structure are consistent across
all commands.

The interface requires a `canHandle` method that returns a boolean indicating if
the command can handle the given input. The `handle` method is called when the command is
executed. These are all managed by the [CommandHandler](CommandHandler.ts) service.

## Adding a new command

Since dependancies are handled by injection, you need to add the class to the injection container
in [inversify.config.ts](inversify.config.ts). Keys for injection are defined in [types.ts](types.ts).

To add a new command, you simply need to bind the new command to the `TYPES.Command` key on the container.

```typescript
container.bind<ICommand>(TYPES.Commands).to(Command);
```
