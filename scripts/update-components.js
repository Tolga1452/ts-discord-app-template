import { readdirSync, writeFileSync } from 'fs';

const files = readdirSync('./src/interactions/components').filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', '').replaceAll('-', '_'));

let content = `import { Component } from '../types/index.js';\n\n`;

for (const file of files) {
    content += `import ${file} from '../interactions/components/${file.replaceAll('_', '-')}.js';\n`;
};

content += `\nexport default [${files.join(', ')}] satisfies Component[];\n`;

writeFileSync('./src/utils/components.ts', content, 'utf8');
