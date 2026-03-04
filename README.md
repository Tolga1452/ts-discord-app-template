<h1 align="center">
	Discord App Template for TypeScript
  <br />
  <br />
	<a href="https://notbyai.fyi"><img src="https://raw.githubusercontent.com/Tolga1452/ts-discord-app-template/main/assets/notbyai.png" height="42px" /></a>
  <br />
  <a href="https://github.com/Tolga1452/ts-discord-app-template/generate"><img alt="Use this template" src="https://img.shields.io/badge/use_this-template-2ea44f?logo=github" /></a>
  <br />
  <a href="https://github.com/Tolga1452/ts-discord-app-template/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/Tolga1452/ts-discord-app-template" /></a>
  <a href="https://github.com/Tolga1452/ts-discord-app-template/releases"><img alt="Release" src="https://img.shields.io/github/v/release/Tolga1452/ts-discord-app-template?display_name=tag" /></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://bun.sh"><img alt="Bun" src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white" /></a>
  <a href="https://discord.js.org"><img alt="discord.js" src="https://img.shields.io/github/package-json/dependency-version/Tolga1452/ts-discord-app-template/discord.js" /></a>
</h1>

This is a practical and advanced template for creating Discord applications using TypeScript. It includes some useful features, a basic file structure, example interaction files, and event handling.

> [!NOTE]
> This project is under the MIT license. You are not required to credit me, but I would really appreciate it if you do.

## Features

- Fully typed with the pain of TypeScript.
- Super simple event and interaction handling. I sacrificed my sanity for this.
- Comes with `clientReady` and `interactionCreate` events along with example interaction files.
- Custom interaction functions: `interaction.reply2()`, `interaction.update2()`, and `interaction.disableComponents()`. These functions are made for automatically using components v2 along with some more useful features. [Click here to learn more](#interactions).
- An advanced but simple way to use custom IDs. Working with args inside components has never been easier.
- Automatic emoji syncing between your local folder and Discord application. I sacrificed my soul for this because Discord doesn't have an endpoint for bulk emoji management. [Click here to learn more](#emoji-syncing).
- Easy error handling, included with funny error messages.
- A useful debugging utility.

## File Structure

```
/src
├── /classes
│   └── CustomIdArgs.ts
│
├── /events
│   ├── interactionCreate.ts
│   └── ready.ts
│
├── /interactions
│   │
│   ├── /commands
│   │   ├── Launch-Activity.ts
│   │   ├── Message-Test.ts
│   │   ├── slash-test.ts
│   │   └── User-Test.ts
│   │
│   ├── /components
│   │   ├── component-test.ts
│   │   └── modal-test-button.ts
│   │
│   └── /components
│       └── modal-test.ts
│
├── /types
│   ├── enums.ts
│   └── index.ts
│
├── /utils
│   ├── buildCustomId.ts
│   ├── commands.ts
│   ├── components.ts
│   ├── debug.ts
│   ├── events.ts
│   └── modals.ts
│
└── index.ts
```

## Getting Started

> [!NOTE]
> This template uses [Bun](https://bun.sh/). It is recommended to use `bun` for installing dependencies and running scripts.
> 
> To install bun, see the [official installation guide](https://bun.com/get).

1. Create a new repository using this template or clone it to your local machine.

<a href="https://github.com/Tolga1452/ts-discord-app-template/generate"><img alt="Use this template" src="https://img.shields.io/badge/use_this-template-2ea44f?logo=github" /></a>

```bash
git clone https://github.com/Tolga1452/ts-discord-app-template.git my-discord-app
```

2. Install the dependencies

```bash
cd my-discord-app
bun install
```

> [!TIP]
> You can run `bun clean` to remove any example interaction files.

3. Rename the `.env.example` file to `.env` and update the environment variables as needed.

- `NODE_ENV`: Change this **ONLY** if you are using separate bots for development and production. Set to `"development"` or `"production"` depending on the environment.
- `DEBUG`: Set to `"true"` to enable debug logging.
- `DISCORD_REGISTER_COMMANDS`: Set to `"true"` to automatically register commands when your application starts.
- `DISCORD_APP_ID`: Your Discord application ID (required).
- `DISCORD_BOT_TOKEN`: Your bot token (required).

```bash
cp .env.example .env
```

4. Run your application to test (`bun start` is intended for production).

```bash
bun dev
```

## Tips

### Emoji Syncing

> [!CAUTION]
> If you are using separate bots for development and production, make sure to set the `NODE_ENV` environment variable accordingly. The emoji syncing system uses different cache files for different environments to avoid conflicts.

This template comes with a script that automatically syncs your Discord application's emojis with your local folder, using your local folder as the source.

Any emojis you add/modify/remove in the `src/emojis` folder will be synced to your Discord application when you run `pnpm emojis` or `pnpm start`. Synced emojis will be available in the `src/types/emojis.ts` file as the `Emoji` enum.

> [!CAUTION]
> This system uses the `.projectCache` folder to keep track of the synced emojis. You **ARE** supposed to commit this folder because running the application without emoji cache will result in conflicts and errors.

Since only the local folder is used as the source, it is not recommended to manually manage emojis from the Discord Developer Portal. But don't worry, if you have existing emojis in your application that are not cached locally, they will be automatically downloaded to the local folder and added to cache during the syncing process.

If you do not want to use this feature at all, you can simply remove the `bun gen:emojis` part from the `start` and `gen:all` scripts in the `package.json` file.

### Emojis in Interaction Responses

This project uses a custom way to use emojis in the interaction responses.

These emojis can also be used in the `interaction.reply2()` and `interaction.update2()` custom interaction functions, by providing the `emoji` field in the options object.

> [!NOTE]
> This feature is typed using the `Emoji` enum from the file `src/types/emojis.ts` that is automatically generated during the [Emoji Syncing](#emoji-syncing) process (or should be manually updated if you removed the feature).

### Interactions

For interaction responses, you can use the `interaction.reply2()`, `interaction.update2()`, and `interaction.disableComponents()` custom functions that are implemented directly into the interactions.

All of the functions automatically use components v2.

#### `interaction.reply2(options: string | InteractionReplyOptions, followUp: boolean = false)`

Replaces the `interaction.reply()`, `interaction.editReply()`, and `interaction.followUp()` functions.

**Behavior before the response:**
1. Adds the `IS_COMPONENTS_V2` flag to the response.
2. If `options` is a string, automatically overwrites the whole `components` field with a single Text Display component with the content of `options`.
3. If the `content` field is provided in `options`, does the same as step 2 for the `content` field.
4. If the `emoji` field (a custom field) is provided in `options`, the emoji will automatically be added to the first Text Display component of the response.

**Behavior for response:**
1. If `followUp` is `true`, it will use `interaction.followUp()`.
2. If the interaction is already deferred or replied, it will use `interaction.editReply()`.
3. If none of the above conditions are met, it will use `interaction.reply()`.

**Example Usage:**
```ts
interaction.reply2('Hello World!');

interaction.reply2({
  emoji: Emoji.Happy,
  content: 'Hello World!'
});
```

#### `interaction.update2(options: string | InteractionReplyOptions)`

Replaces the `interaction.update()` function.

**Behavior before the response:**
1. Adds the `IS_COMPONENTS_V2` flag to the response.
2. If `options` is a string, automatically overwrites the whole `components` field with a single Text Display component with the content of `options`.
3. If the `content` field is provided in `options`, does the same as step 2 for the `content` field.
4. If the `emoji` field (a custom field) is provided in `options`, the emoji will automatically be added to the first Text Display component of the response.

**Behavior for response:**
It will use `interaction.update()`.

**Example Usage:**
```ts
interaction.update2('You clicked the button!');

interaction.update2({
  emoji: Emoji.Wave,
  content: 'You clicked the button!'
});
```

#### `interaction.disableComponents(exceptIds?: number[])`

You can use this function to disable all interactive components of the reply or original message. It is especially useful when you have a long-running task and you want to prevent users from clicking the components multiple times until the task is finished.

> [!NOTE]
> There's no function to enable the components again. If you need a reply you can reuse, you can create a small helper that builds the message. That's usually better than duplicating the same code for the original reply and the updated versions.

You can also use the `exceptIds` parameter to specify ID(s) of components that you want to keep enabled. **Note that these are the number IDs of the components, not the custom IDs.**

- **For chat input, context menu, and modal interactions:** If you have already replied, this function will disable the components of the reply.
- **For component interactions:** This function will disable the components of the original message (this function can also be a replacement for `interaction.deferUpdate()`). If you want to disable the components of the reply to the interaction instead, you should use the `disableReplyComponents()` function.

**Example Usage:**
```ts
// A component interaction. We want to update the original message here, so we disable the components of the original message.
await interaction.disableComponents();

// A task that may take a while to complete
const user = await db.getUser(interaction.user.id);

await interaction.reply2(`Hello, ${user.name}!`);
```

### Custom IDs

#### `buildCustomId(customId: string, args: ...any[])`

For components and modals, you need to set a custom ID. And in some cases you may need to add some additional metadata to custom IDs.

The `buildCustomId()` utility is an useful way to set custom IDs with additional metadata. It basically converts your input into a string that the interaction handler can easily parse. The function automatically converts all arguments to strings.

For example `buildCustomId('my-button', user.id, channel.id)` will produce a string like `my-button:1234567890,0987654321`.

**Example Usage:**
```ts
interaction.reply({
  components: [
    new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId(buildCustomId('my-button', user.id, channel.id))
          .setLabel('Click Me!')
          .setStyle(ButtonStyle.Primary)
      )
  ]
});
```

#### Handling Custom IDs

Component and modal files use a special way to handle custom IDs. You can give keys for the each argument you added to the custom ID by adding them to the `args` array. TypeScript will automatically infer the types of the arguments based on their positions in the array.

Then all you have to do is use the `args` class provided by the interaction handler, like `args.get('userId')`.

**Example Usage:**
```ts
const args = ['userId', 'channelId'] as const;

export default {
    customId: 'my-button',
    args,
    async execute(interaction, args) {
        await interaction.deferUpdate();

        const userId = args.get('userId');
        const channelId = args.get('channelId');

        if (!userId || !channelId) throw new Error('Missing required arguments');

        await interaction.reply2(`Command used by <@${userId}>, in channel <#${channelId}>`);
    }
} satisfies Component<ComponentType.Button, typeof args>;
```

### Error Handling

This template uses a simple way to handle errors in interactions. If something goes wrong, just throw an error. It will be caught and logged to the console, and the interaction will respond with a default error message.

> [!NOTE]
> In order to handle errors from async functions, you always need to `await` them in the interaction file. Otherwise the interaction handler will not be able to catch the error.

**Example Usage:**
```ts
const channel = await interaction.client.channels.fetch(channelId);

if (!channel) throw new Error(`Could not find channel with ID ${channelId}`);
```

### Debugging

You can use the `debug(...args: any[])` utility function to log debug information.

This function works the same as `console.debug()`, the only difference is that it only logs when the `DEBUG` environment variable is set to `"true"`.

## Helpful Scripts

### `bun command`

This script allows you to quickly manage your app's command files.

#### Example Usage

```bash
bun command create slash my-command
bun command remove my-command
bun command clear
```

#### `bun command create`

Creates a new command file.

**Usage:** `bun command create [<type>] [<name>] [<options>]`

**Arguments**
- `type` (`--type`): The type of command to create (`slash`, `user`, `message`, `activity`). Default is `slash`.
- `name` (`--name`): The name of the command. Default is `new-command`.
- `--help`, `-h`: Show help information.
- `--autocomplete`, `-ac`: For slash commands, implements autocomplete functionality.
- `--guild <guild-id>`, `-g <guild-id>`: The ID of the guild to restrict the command to.

#### `bun command remove`

Removes an existing command file.

**Usage:** `bun command remove <name>`

**Arguments**
- `name` (`--name`): The name of the command to remove. Required.

#### `bun command clear`

Removes all existing command files.

**Usage:** `bun command clear`

### `bun component`

This script allows you to quickly manage your app's component files.

#### Example Usage

```bash
bun component create my-component
bun component remove my-component
bun component clear
```

#### `bun component create`

Creates a new component file.

**Usage:** `bun component create [<name>]`

**Arguments**
- `name` (`--name`): The custom ID of the component to create. Default is `new-component`.

#### `bun component remove`

Removes an existing component file.

**Usage:** `bun component remove <name>`

**Arguments**
- `name` (`--name`): The custom ID of the component to remove. Required.

#### `bun component clear`

Removes all existing component files.

**Usage:** `bun component clear`

### `bun modal`

This script allows you to quickly manage your app's modal files.

#### Example Usage

```bash
bun modal create my-modal
bun modal remove my-modal
bun modal clear
```

#### `bun modal create`

Creates a new modal file.

**Usage:** `bun modal create [<name>]`

**Arguments**
- `name` (`--name`): The custom ID of the modal to create. Default is `new-modal`.

#### `bun modal remove`

Removes an existing modal file.

**Usage:** `bun modal remove <name>`

**Arguments**
- `name` (`--name`): The custom ID of the modal to remove. Required.

#### `bun modal clear`

Removes all existing modal files.

**Usage:** `bun modal clear`

### `bun event`

This script allows you to quickly manage your app's event files.

#### Example Usage

```bash
bun event create interactionCreate
bun event remove interactionCreate
bun event clear
```

#### `bun event create`

Creates a new event file.

**Usage:** `bun event create [<name>]`

**Arguments**
- `name` (`--name`): The name of the event to create. Default is `newEvent`.

#### `bun event remove`

Removes an existing event file.

**Usage:** `bun event remove <name>`

**Arguments**
- `name` (`--name`): The name of the event to remove. Required.

#### `bun event clear`

Removes all existing event files.

**Usage:** `bun event clear`
