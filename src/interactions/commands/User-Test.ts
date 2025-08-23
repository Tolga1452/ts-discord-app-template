import { ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType } from 'discord.js';
import { UserContextMenuCommand } from '../../types/index.js';

export default {
    data: new ContextMenuCommandBuilder()
        .setType(2)
        .setName('User Test')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.targetUser;

        await interaction.reply2(user.username);
    }
} satisfies UserContextMenuCommand;
