import { ButtonStyle, Component, ComponentType } from 'discord.js';

export default function disableComponents(components: Component[], exceptIds?: number[]): Component[] {
    const result: Component[] = [];

    for (const component of components) {
        if ('components' in component && Array.isArray(component.components) && component.components.length) component.components = disableComponents(component.components, exceptIds);

        if (!exceptIds || !exceptIds.includes(component.id!) || !exceptIds.includes(component.data?.id!)) {
            if ('accessory' in component && component.accessory && 'data' in (component.accessory as any) && ((component.accessory as any).data?.style ? (component.accessory as any).data.style !== ButtonStyle.Link : true)) (component.accessory as any).data.disabled = true;
            if ([ComponentType.Button, ComponentType.StringSelect, ComponentType.ChannelSelect, ComponentType.MentionableSelect, ComponentType.UserSelect, ComponentType.RoleSelect].includes(component.type) && ('style' in component.data ? component.data.style !== ButtonStyle.Link : true)) (component.data as any).disabled = true;
        };

        result.push(component);
    };

    return result;
};
