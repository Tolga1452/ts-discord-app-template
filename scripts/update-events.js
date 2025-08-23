import { readdirSync, writeFileSync } from 'fs';

const files = readdirSync('./src/events').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', ''));

let content = `import { ClientEvents } from 'discord.js';\nimport { GatewayEvent } from '../types/index.js';\n\n`;

for (const file of files) {
    content += `import ${file} from '../events/${file}.js';\n`;
};

content += `\nexport default { ${files.join(', ')} } satisfies Partial<Record<keyof ClientEvents, GatewayEvent>>;\n`;

writeFileSync('./src/utils/events.ts', content, 'utf8');
