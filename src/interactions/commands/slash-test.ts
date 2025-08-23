import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, InteractionContextType, SlashCommandBuilder, TextDisplayBuilder } from 'discord.js';
import { ChatInputCommand } from '../../types/index.js';
import buildCustomId from '../../utils/buildCustomId.js';

export default {
    data: new SlashCommandBuilder()
        .setName('slash-test')
        .setDescription('Placeholder description.')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        const randomNumber = Math.floor(Math.random() * 100) + 1;

        await interaction.reply2({
            components: [
                new TextDisplayBuilder()
                    .setContent('Click this button:'),
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(buildCustomId('component-test', interaction.user.id, randomNumber))
                            .setLabel('Click me!')
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });
    }
} satisfies ChatInputCommand;
