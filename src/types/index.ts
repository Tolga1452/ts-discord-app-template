import { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, ClientEvents, ComponentType, ContextMenuCommandBuilder, InteractionCallbackResponse, InteractionReplyOptions, InteractionResponse, InteractionUpdateOptions, Message, MessageComponentInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, PrimaryEntryPointCommandData, PrimaryEntryPointCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, Snowflake, UserContextMenuCommandInteraction } from 'discord.js';
import { Emoji } from './enums.js';
import CustomIdArgs from '../classes/CustomIdArgs.js';

export interface BaseNonPrimaryEntryPointCommand {
    guild?: Snowflake;
};

export interface ChatInputCommand extends BaseNonPrimaryEntryPointCommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: CustomChatInputCommandInteraction): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
};

export interface UserContextMenuCommand extends BaseNonPrimaryEntryPointCommand {
    data: ContextMenuCommandBuilder;
    execute(interaction: CustomUserContextMenuCommandInteraction): Promise<void>;
};

export interface MessageContextMenuCommand extends BaseNonPrimaryEntryPointCommand {
    data: ContextMenuCommandBuilder;
    execute(interaction: CustomMessageContextMenuCommandInteraction): Promise<void>;
};

export interface PrimaryEntryPointCommand {
    data: PrimaryEntryPointCommandData;
    execute?(interaction: PrimaryEntryPointCommandInteraction): Promise<void>;
};

export type NonPrimaryEntryPointCommand = ChatInputCommand | UserContextMenuCommand | MessageContextMenuCommand;

export type Command = NonPrimaryEntryPointCommand | PrimaryEntryPointCommand;

export interface GatewayEvent<Event extends keyof ClientEvents = any> {
    name: Event;
    execute(...args: ClientEvents[Event]): Promise<void>;
};

export interface CustomChatInputCommandInteraction extends ChatInputCommandInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
};

export interface CustomUserContextMenuCommandInteraction extends UserContextMenuCommandInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
};

export interface CustomMessageContextMenuCommandInteraction extends MessageContextMenuCommandInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
};

export interface CustomMessageContextMenuCommandInteraction extends MessageContextMenuCommandInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
};

export interface CustomMessageComponentInteraction extends MessageComponentInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
    update2(options: string | CustomInteractionUpdateOptions): Promise<InteractionCallbackResponse | Message<boolean> | InteractionResponse<boolean>>;
};

export interface CustomModalSubmitInteraction extends ModalSubmitInteraction {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
};

export type CustomCommandInteraction = CustomChatInputCommandInteraction | CustomUserContextMenuCommandInteraction | CustomMessageContextMenuCommandInteraction;

export interface CustomInteractionReplyOptions extends InteractionReplyOptions {
    emoji?: Emoji;
};

export interface CustomInteractionUpdateOptions extends InteractionUpdateOptions {
    emoji?: Emoji;
};

export type AnyComponentInteraction = ButtonInteraction | AnySelectMenuInteraction;

type ComponentInteractionWithCustom<Type extends AnyComponentInteraction> = Type & {
    reply2(options: string | CustomInteractionReplyOptions, followUp?: boolean): Promise<InteractionResponse<boolean> | Message<boolean>>;
    update2(options: string | CustomInteractionUpdateOptions): Promise<InteractionCallbackResponse | Message<boolean> | InteractionResponse<boolean>>;
};

type ComponentInteractionOf<Type extends ComponentType> = Extract<AnyComponentInteraction, { componentType: Type }>;

export type Component<Type extends ComponentType = ComponentType, Args extends readonly string[] = readonly string[]> = {
    customId: string;
    args: Args;
    execute(interaction: ComponentInteractionWithCustom<ComponentInteractionOf<Type>>, args: CustomIdArgs<Args>): Promise<void>;
};

export interface Modal<Args extends readonly string[] = readonly string[]> {
    customId: string;
    args: Args;
    execute(interaction: CustomModalSubmitInteraction, args: CustomIdArgs<Args>): Promise<void>;
};
