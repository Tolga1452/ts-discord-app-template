import { ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType } from 'discord.js';
import { MessageContextMenuCommand } from '../../types/index.js';

export default {
    data: new ContextMenuCommandBuilder()
        .setType(3)
        .setName('Message Test')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        const message = interaction.targetMessage;

        await interaction.reply2(message.content);
    }
} satisfies MessageContextMenuCommand;
