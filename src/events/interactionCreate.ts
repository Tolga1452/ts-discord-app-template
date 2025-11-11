import { BitField, InteractionEditReplyOptions, InteractionReplyOptions, InteractionUpdateOptions, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { CustomCommandInteraction, CustomMessageComponentInteraction, CustomModalSubmitInteraction, GatewayEvent } from '../types/index.js';
import commands from '../utils/commands.js';
import debug from '../utils/debug.js';
import { Emoji } from '../types/enums.js';
import components from '../utils/components.js';
import CustomIdArgs from '../classes/CustomIdArgs.js';
import modals from '../utils/modals.js';

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        debug('Received interaction:', interaction);

        if (interaction.isCommand()) {
            (interaction as CustomCommandInteraction).reply2 = async (options, followUp = false) => {
                let replyOptions: InteractionReplyOptions;

                if (typeof options === 'string') {
                    replyOptions = {
                        flags: [MessageFlags.IsComponentsV2],
                        components: [
                            new TextDisplayBuilder()
                                .setContent(options)
                        ]
                    };
                } else {
                    replyOptions = options;

                    if (replyOptions.flags) replyOptions.flags = new BitField(replyOptions.flags).add(MessageFlags.IsComponentsV2);
                    else replyOptions.flags = [MessageFlags.IsComponentsV2];
                };

                if (replyOptions.content) {
                    replyOptions.components = [
                        new TextDisplayBuilder()
                            .setContent(replyOptions.content)
                    ];

                    replyOptions.content = undefined;
                };

                if (typeof options === 'object' && options.emoji && replyOptions.components?.length) {
                    const textDisplay = replyOptions.components.find(component => component instanceof TextDisplayBuilder);

                    if (textDisplay) textDisplay.setContent(` ${options.emoji} ${textDisplay.data.content}`);
                };

                if (followUp) return await interaction.followUp(replyOptions);
                else if (interaction.replied || interaction.deferred) return await interaction.editReply(replyOptions as InteractionEditReplyOptions);
                else return await interaction.reply(replyOptions);
            };

            const command = commands.find(cmd => cmd.data.name === interaction.commandName);

            if (!command) {
                console.warn(`Command not found: ${interaction.commandName}`);

                await (interaction as CustomCommandInteraction).reply2({
                    flags: [MessageFlags.Ephemeral],
                    emoji: Emoji.Melting,
                    content: 'Are you sure you are not a schizo? This command has never existed!'
                });

                return;
            };

            if ('execute' in command) {
                try {
                    await command.execute(interaction as any);
                } catch (error) {
                    console.error('Error executing command:', error, command);

                    await (interaction as CustomCommandInteraction).reply2({
                        flags: [MessageFlags.Ephemeral],
                        emoji: Emoji.Dead,
                        content: 'This command feels... wrong. Maybe try again later?'
                    });
                };
            };
        } else if (interaction.isMessageComponent()) {
            (interaction as CustomMessageComponentInteraction).reply2 = async (options, followUp = false) => {
                let replyOptions: InteractionReplyOptions;

                if (typeof options === 'string') {
                    replyOptions = {
                        flags: [MessageFlags.IsComponentsV2],
                        components: [
                            new TextDisplayBuilder()
                                .setContent(options)
                        ]
                    };
                } else {
                    replyOptions = options;

                    if (replyOptions.flags) replyOptions.flags = new BitField(replyOptions.flags).add(MessageFlags.IsComponentsV2);
                    else replyOptions.flags = [MessageFlags.IsComponentsV2];
                };

                if (replyOptions.content) {
                    replyOptions.components = [
                        new TextDisplayBuilder()
                            .setContent(replyOptions.content)
                    ];

                    replyOptions.content = undefined;
                };

                if (typeof options === 'object' && options.emoji && replyOptions.components?.length) {
                    const textDisplay = replyOptions.components.find(component => component instanceof TextDisplayBuilder);

                    if (textDisplay) textDisplay.setContent(` ${options.emoji} ${textDisplay.data.content}`);
                };

                if (followUp) return await interaction.followUp(replyOptions);
                else if (interaction.replied || interaction.deferred) return await interaction.editReply(replyOptions as InteractionEditReplyOptions);
                else return await interaction.reply(replyOptions);
            };

            (interaction as CustomMessageComponentInteraction).update2 = async (options) => {
                let updateOptions: InteractionUpdateOptions;

                if (typeof options === 'string') {
                    updateOptions = {
                        flags: [MessageFlags.IsComponentsV2],
                        components: [
                            new TextDisplayBuilder()
                                .setContent(options)
                        ]
                    };
                } else {
                    updateOptions = options;

                    if (updateOptions.flags) updateOptions.flags = new BitField(updateOptions.flags).add(MessageFlags.IsComponentsV2);
                    else updateOptions.flags = [MessageFlags.IsComponentsV2];
                };

                if (updateOptions.content) {
                    updateOptions.components = [
                        new TextDisplayBuilder()
                            .setContent(updateOptions.content)
                    ];

                    updateOptions.content = undefined;
                };

                if (typeof options === 'object' && options.emoji && updateOptions.components?.length) {
                    const textDisplay = updateOptions.components.find(component => component instanceof TextDisplayBuilder);

                    if (textDisplay) textDisplay.setContent(` ${options.emoji} ${textDisplay.data.content}`);
                };

                return await interaction.update(updateOptions);
            };

            const [customId, argList] = interaction.customId.split(':');

            const args = argList ? argList.split(',') : [];

            const component = components.find(c => c.customId === customId);

            if (!component) {
                console.warn(`Component not found: ${customId}`);

                await (interaction as CustomMessageComponentInteraction).reply2({
                    flags: [MessageFlags.Ephemeral],
                    emoji: Emoji.Melting,
                    content: 'Looks like you clicked a non-existent component!'
                });

                return;
            };

            try {
                await component.execute(interaction as any, new CustomIdArgs<any>(component, args));
            } catch (error) {
                console.error('Error executing component:', error, component);

                await (interaction as CustomMessageComponentInteraction).reply2({
                    flags: [MessageFlags.Ephemeral],
                    emoji: Emoji.Dead,
                    content: 'Looks like this component feels sick right now. Can you try again later?'
                });
            };
        } else if (interaction.isModalSubmit()) {
            (interaction as CustomModalSubmitInteraction).reply2 = async (options, followUp = false) => {
                let replyOptions: InteractionReplyOptions;

                if (typeof options === 'string') {
                    replyOptions = {
                        flags: [MessageFlags.IsComponentsV2],
                        components: [
                            new TextDisplayBuilder()
                                .setContent(options)
                        ]
                    };
                } else {
                    replyOptions = options;

                    if (replyOptions.flags) replyOptions.flags = new BitField(replyOptions.flags).add(MessageFlags.IsComponentsV2);
                    else replyOptions.flags = [MessageFlags.IsComponentsV2];
                };

                if (replyOptions.content) {
                    replyOptions.components = [
                        new TextDisplayBuilder()
                            .setContent(replyOptions.content)
                    ];

                    replyOptions.content = undefined;
                };

                if (typeof options === 'object' && options.emoji && replyOptions.components?.length) {
                    const textDisplay = replyOptions.components.find(component => component instanceof TextDisplayBuilder);

                    if (textDisplay) textDisplay.setContent(` ${options.emoji} ${textDisplay.data.content}`);
                };

                if (followUp) return await interaction.followUp(replyOptions);
                else if (interaction.replied || interaction.deferred) return await interaction.editReply(replyOptions as InteractionEditReplyOptions);
                else return await interaction.reply(replyOptions);
            };

            const [customId, argList] = interaction.customId.split(':');

            const args = argList ? argList.split(',') : [];

            const modal = modals.find(m => m.customId === customId);

            if (!modal) {
                console.warn(`Modal not found: ${customId}`);

                await (interaction as CustomModalSubmitInteraction).reply2({
                    flags: [MessageFlags.Ephemeral],
                    emoji: Emoji.Melting,
                    content: 'Did you just... interact with an imaginary modal?'
                });

                return;
            };

            try {
                await modal.execute(interaction as CustomModalSubmitInteraction, new CustomIdArgs<any>(modal, args));
            } catch (error) {
                console.error('Error executing modal:', error, modal);

                await (interaction as CustomModalSubmitInteraction).reply2({
                    flags: [MessageFlags.Ephemeral],
                    emoji: Emoji.Dead,
                    content: 'I guess this modal is just exploded. What... did you do?'
                });
            };
        };
    }
} satisfies GatewayEvent<'interactionCreate'>;
