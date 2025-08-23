import { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder, Snowflake } from 'discord.js';
import { GatewayEvent, NonPrimaryEntryPointCommand } from '../types/index.js';
import commands from '../utils/commands.js';

export default {
    name: 'ready',
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        if (process.env.DISCORD_REGISTER_COMMANDS === 'true') {
            const globalCommands = commands.filter(command => !('guild' in command));

            if (globalCommands.length) await client.application.commands.set(globalCommands.map(command => ('type' in command.data && command.data.type === ApplicationCommandType.PrimaryEntryPoint) ? command.data : (command.data as unknown as SlashCommandBuilder | ContextMenuCommandBuilder).toJSON()))
                .then(() => console.log(`Registered ${globalCommands.length} global commands.`))
                .catch(error => console.error(`Failed to register global commands: ${error}`));

            const guildCommands = commands.filter(command => 'guild' in command) as NonPrimaryEntryPointCommand[];

            if (guildCommands.length) {
                const guilds: Record<Snowflake, NonPrimaryEntryPointCommand[]> = {};

                for (const command of guildCommands) {
                    if (!command.guild) continue;

                    if (!guilds[command.guild]) guilds[command.guild] = [];

                    guilds[command.guild].push(command);
                };

                for (const [guildId, cmds] of Object.entries(guilds)) {
                    await client.guilds.fetch(guildId)
                        .then(guild => {
                            if (!guild) return;

                            guild.commands.set(cmds.map(command => command.data.toJSON()))
                                .then(() => console.log(`Registered ${cmds.length} commands for guild ${guildId}.`))
                                .catch(error => console.error(`Failed to register commands for guild ${guildId}: ${error}`));
                        })
                        .catch(error => console.error(`Failed to register commands for guild ${guildId}: ${error}`));

                    await new Promise(resolve => setTimeout(resolve, 1000));
                };
            };
        };
    }
} satisfies GatewayEvent<'ready'>;
