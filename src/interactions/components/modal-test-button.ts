import { ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Component } from '../../types/index.js';
import buildCustomId from '../../utils/buildCustomId.js';

const args = ['number'] as const;

export default {
    customId: 'modal-test-button',
    args,
    execute: async (interaction, args) => {
        await interaction.showModal(
            new ModalBuilder()
                .setCustomId(buildCustomId('modal-test', args.get('number')))
                .setTitle('Modal Test')
                .setComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .setComponents(
                            new TextInputBuilder()
                                .setCustomId('modal-test-input')
                                .setLabel('Write something')
                                .setStyle(TextInputStyle.Short)
                        )
                )
        );
    }
} satisfies Component<ComponentType.Button, typeof args>;
