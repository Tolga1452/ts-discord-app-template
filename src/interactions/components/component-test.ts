import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextDisplayBuilder, userMention } from 'discord.js';
import { Component } from '../../types/index.js';
import { Emoji } from '../../types/emojis.js';
import buildCustomId from '../../utils/buildCustomId.js';

const args = ['userId', 'number'] as const;

export default {
    customId: 'component-test',
    args,
    async execute(interaction, args) {
        await interaction.deferUpdate();

        const number = args.get('number');

        await interaction.reply2({
            emoji: Emoji.Sip,
            components: [
                new TextDisplayBuilder()
                    .setContent(`Command used by ${userMention(args.get('userId')!)}, random number: ${number}`),
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(
                        new ButtonBuilder()
                            .setCustomId(buildCustomId('modal-test-button', number))
                            .setLabel('Click me again!')
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });

        await interaction.reply2('Follow-up message', true);
    }
} satisfies Component<ComponentType.Button, typeof args>;
