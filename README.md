<h2 align="center">
	Discord App Template for TypeScript
  <br />
  <br />
	<a href="https://notbyai.fyi"><img src="https://raw.githubusercontent.com/Tolga1452/ts-discord-app-template/main/assets/notbyai.png" height="84px" /></a>
</h2>

This is a practical and advanced template for creating Discord applications using TypeScript. It includes some useful features, a basic file structure, example interaction files, and event handling.

## Features

- Fully typed with the pain of TypeScript.
- Super simple event and interaction handling. I sacrificed my sanity for this.
- Comes with `ready` and `interactionCreate` events along with example interaction files.
- Custom interaction functions: `interaction.reply2()` and `interaction.update2()`. These functions are made for automatically using components v2 along with some more useful features. [Click here to learn more](#interactions).
- An advanced but simple way to use custom IDs. Working with args inside components has never been easier.
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
> This template uses [pnpm](https://pnpm.io/) as the package manager. It is recommended to use `pnpm` for installing dependencies and running scripts.
> 
> Run `npm install -g pnpm` to install pnpm globally.

1. Create a new repository using this template or clone it to your local machine.

```bash
git clone https://github.com/Tolga1452/ts-discord-app-template.git my-discord-app
```

2. Set up the development environment

```bash
cd my-discord-app
pnpm dev
```

> [!TIP]
> You can use the script `pnpm dev:clean` to remove any example interaction files.

3. Rename the `.env.example` file to `.env` and update the environment variables as needed.

- `DEBUG`: Set to `"true"` to enable debug logging.
- `DISCORD_REGISTER_COMMANDS`: Set to `"true"` to automatically register commands when your application starts.
- `DISCORD_TOKEN`: Your bot token (required).

```bash
cp .env.example .env
```

4. Run your application

```bash
pnpm start
```

5. After deploying your code, set up the production environment and run it.

```bash
pnpm prod
pnpm start
```

## Tips

### Emojis

This project uses a custom way to use emojis in the interaction responses. You can edit the `types/enums.ts` file to modify emojis.

These emojis can also be used in the `interaction.reply2()` and `interaction.update2()` custom interaction functions, by providing the `emoji` field in the options object.

### Interactions

For interaction responses, you can use the `interaction.reply2()` and `interaction.update2()` custom functions that are implemented directly into the interactions.

The both functions automatically use components v2.

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

interaction.reply2({
  emoji: Emoji.Wave,
  content: 'You clicked the button!'
});
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

### `pnpm up`

If you want to update your dependencies to their latest versions (by ignoring the version ranges specified in `package.json`), you can use this command.

Since this script might update your dependencies to major versions, the updates may include breaking changes.

### `pnpm command`

This script allows you to quickly manage your app's command files.

#### Example Usage

```bash
pnpm command create slash my-command
pnpm command remove my-command
pnpm command clear
```

#### `pnpm command create`

Creates a new command file.

**Usage:** `pnpm command create [<type>] [<name>] [<options>]`

**Arguments**
- `type` (`--type`): The type of command to create (`slash`, `user`, `message`, `activity`). Default is `slash`.
- `name` (`--name`): The name of the command. Default is `new-command`.
- `--help`, `-h`: Show help information.
- `--autocomplete`, `-ac`: For slash commands, implements autocomplete functionality.
- `--guild <guild-id>`, `-g <guild-id>`: The ID of the guild to restrict the command to.

#### `pnpm command remove`

Removes an existing command file.

**Usage:** `pnpm command remove <name>`

**Arguments**
- `name` (`--name`): The name of the command to remove. Required.

#### `pnpm command clear`

Removes all existing command files.

**Usage:** `pnpm command clear`

### `pnpm component`

This script allows you to quickly manage your app's component files.

#### Example Usage

```bash
pnpm component create my-component
pnpm component remove my-component
pnpm component clear
```

#### `pnpm component create`

Creates a new component file.

**Usage:** `pnpm component create [<name>]`

**Arguments**
- `name` (`--name`): The custom ID of the component to create. Default is `new-component`.

#### `pnpm component remove`

Removes an existing component file.

**Usage:** `pnpm component remove <name>`

**Arguments**
- `name` (`--name`): The custom ID of the component to remove. Required.

#### `pnpm component clear`

Removes all existing component files.

**Usage:** `pnpm component clear`

### `pnpm modal`

This script allows you to quickly manage your app's modal files.

#### Example Usage

```bash
pnpm modal create my-modal
pnpm modal remove my-modal
pnpm modal clear
```

#### `pnpm modal create`

Creates a new modal file.

**Usage:** `pnpm modal create [<name>]`

**Arguments**
- `name` (`--name`): The custom ID of the modal to create. Default is `new-modal`.

#### `pnpm modal remove`

Removes an existing modal file.

**Usage:** `pnpm modal remove <name>`

**Arguments**
- `name` (`--name`): The custom ID of the modal to remove. Required.

#### `pnpm modal clear`

Removes all existing modal files.

**Usage:** `pnpm modal clear`

### `pnpm event`

This script allows you to quickly manage your app's event files.

#### Example Usage

```bash
pnpm event create interactionCreate
pnpm event remove interactionCreate
pnpm event clear
```

#### `pnpm event create`

Creates a new event file.

**Usage:** `pnpm event create [<name>]`

**Arguments**
- `name` (`--name`): The name of the event to create. Default is `newEvent`.

#### `pnpm event remove`

Removes an existing event file.

**Usage:** `pnpm event remove <name>`

**Arguments**
- `name` (`--name`): The name of the event to remove. Required.

#### `pnpm event clear`

Removes all existing event files.

**Usage:** `pnpm event clear`
