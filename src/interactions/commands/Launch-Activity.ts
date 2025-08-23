import { ApplicationCommandType, EntryPointCommandHandlerType } from 'discord.js';
import { PrimaryEntryPointCommand } from '../../types/index.js';

export default {
    data: {
        type: ApplicationCommandType.PrimaryEntryPoint,
        name: 'Launch Activity',
        description: 'Placeholder description.',
        handler: EntryPointCommandHandlerType.DiscordLaunchActivity
    }
} satisfies PrimaryEntryPointCommand;
