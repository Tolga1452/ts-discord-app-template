import { readdirSync, writeFileSync } from 'fs';

const files = readdirSync('./src/interactions/modals').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', '').replaceAll('-', '_'));

let content = `import { Modal } from '../types/index.js';\n\n`;

for (const file of files) {
    content += `import ${file} from '../interactions/modals/${file.replaceAll('_', '-')}.js';\n`;
};

content += `\nexport default [${files.join(', ')}] satisfies Modal[];\n`;

writeFileSync('./src/utils/modals.ts', content, 'utf8');
