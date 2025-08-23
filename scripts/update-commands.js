import { readdirSync, writeFileSync } from 'fs';

const files = readdirSync('./src/interactions/commands').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', '').replaceAll('-', '_'));

let content = `import { Command } from '../types/index.js';\n\n`;

for (const file of files) {
    content += `import ${file} from '../interactions/commands/${file.replaceAll('_', '-')}.js';\n`;
};

content += `\nexport default [${files.join(', ')}] satisfies Command[];\n`;

writeFileSync('./src/utils/commands.ts', content, 'utf8');
