export default function buildCustomId(customId: string, ...args: any[]): string {
    if (args.length) return `${customId}:${args.map(arg => String(arg)).join(',')}`;

    return customId;
};
