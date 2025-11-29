import { createHash } from 'crypto';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

config();

const CACHE_DIR = '.projectCache';
const CACHE_FILE = join(CACHE_DIR, 'emojis.json');
const EMOJIS_DIR = 'src/emojis';
const ENUM_FILE = 'src/types/emojis.ts';
const FILE_EXTENSIONS = /\.(png|jpe?g|gif)$/;
const APP_ID = process.env.DISCORD_APP_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function hashFile(path) {
    const buf = await readFile(path);

    return createHash('sha256').update(buf).digest('hex');
};

async function createEmoji(local) {
    let imageData = `data:image/${local.path.endsWith('.png') ? 'png' : local.path.endsWith('.gif') ? 'gif' : 'jpeg'};base64,`;

    const buf = await readFile(local.path);

    imageData += buf.toString('base64');

    const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${BOT_TOKEN}`
        },
        body: JSON.stringify({
            name: local.name,
            image: imageData
        })
    });

    return res;
};

async function deleteEmoji(remote) {
    const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis/${remote.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${BOT_TOKEN}`
        }
    });

    return res;
};

console.log('Loading cached emojis...');

if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR);
if (!existsSync(CACHE_FILE)) await writeFile(CACHE_FILE, JSON.stringify({ version: 1, emojis: [] }));

let cache;

try {
    const raw = await readFile(CACHE_FILE, 'utf-8');

    cache = JSON.parse(raw);
} catch (error) {
    console.error('Error reading cache file:', error);
};

if (!cache) throw new Error('Failed to load cache');
if (cache?.version !== 1) throw new Error('Unsupported cache format or version');

const metaById = new Map(cache.emojis.map(m => [m.id, m]));

console.log('Fetching remote emojis...');

const remoteEmojis = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
    headers: {
        Authorization: `Bot ${BOT_TOKEN}`
    }
})
    .then(async res => {
        if (res.ok) return res.json();

        throw new Error(`Discord API responded with ${res.status} ${res.statusText}: ${await res.text()}`);
    })
    .then(data => data.items)
    .catch(error => {
        console.error('Error fetching emojis:', error);

        return null;
    });

if (!Array.isArray(remoteEmojis)) throw new Error('Failed to fetch emojis from Discord API');

console.log('Retrieving local emojis...');

const localFiles = await readdir(EMOJIS_DIR);
const localEmojis = [];

for (const file of localFiles) {
    if (!FILE_EXTENSIONS.test(file)) {
        console.warn(`Skipping unsupported file "${file}". Only PNG, JPEG, and GIF files are supported.`);

        continue;
    };

    const path = join(EMOJIS_DIR, file);

    const hash = await hashFile(path);

    localEmojis.push({
        name: file.replace(FILE_EXTENSIONS, '').replace(/[^a-zA-Z0-9_]/g, '_'),
        path,
        hash
    });
};

const localByHash = new Map(localEmojis.map(e => [e.hash, e]));
const localByName = new Map(localEmojis.map(e => [e.name, e]));

const processed = [];
const newMeta = [];

let fails = 0;

for (const remote of remoteEmojis) {
    const meta = metaById.get(remote.id);

    if (!meta) {
        console.warn(`Remote-only emoji detected: "${remote.name}" (${remote.id}). This emoji will be downloaded to the local folder.`);

        const ext = remote.animated ? 'gif' : 'png';

        const res = await fetch(`https://cdn.discordapp.com/emojis/${remote.id}.${ext}`);

        if (!res.ok) {
            console.error(`Failed to download emoji "${remote.name}" (${remote.id}) (${res.status} ${res.statusText}):`, await res.text());

            fails++;

            continue;
        };

        const buf = await res.arrayBuffer();

        const path = join(EMOJIS_DIR, `${remote.name}.${ext}`);

        await writeFile(path, Buffer.from(buf));

        const hash = await hashFile(path);

        newMeta.push({
            id: remote.id,
            name: remote.name,
            path,
            hash,
            animated: Boolean(remote.animated)
        });

        console.log(`Downloaded emoji "${remote.name}" (${remote.id})`);

        continue;
    };

    const hashLocal = localByHash.get(meta.hash);

    if (hashLocal) {
        processed.push(hashLocal);

        if (hashLocal.name !== remote.name) {
            const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis/${remote.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${BOT_TOKEN}`
                },
                body: JSON.stringify({ name: hashLocal.name })
            });

            if (!res.ok) {
                console.error(`Failed to update emoji name for ID ${remote.id} (${res.status} ${res.statusText}):`, await res.text());

                newMeta.push(meta);

                fails++;
            } else {
                newMeta.push({
                    id: remote.id,
                    name: hashLocal.name,
                    path: hashLocal.path,
                    hash: hashLocal.hash,
                    animated: Boolean(remote.animated)
                });

                console.log(`Updated emoji name for ID ${remote.id} from "${meta.name}" to "${hashLocal.name}"`);
            };

            continue;
        };
    };

    const nameLocal = localByName.get(remote.name);

    if (nameLocal) {
        processed.push(nameLocal);
        newMeta.push(meta);

        if (nameLocal.hash !== meta.hash) {
            const deleteRes = await deleteEmoji(remote);

            if (!deleteRes.ok) {
                console.error(`Failed to delete emoji ID ${remote.id} (${deleteRes.status} ${deleteRes.statusText}):`, await deleteRes.text());

                newMeta.push(meta);

                fails++;

                continue;
            };

            const createRes = await createEmoji(nameLocal);

            if (!createRes.ok) {
                console.error(`Failed to create emoji "${nameLocal.name}" (${createRes.status} ${createRes.statusText}):`, await createRes.text());

                newMeta.push(meta);

                fails++;

                continue;
            };

            const created = await createRes.json();

            newMeta.push({
                id: created.id,
                name: nameLocal.name,
                path: nameLocal.path,
                hash: nameLocal.hash,
                animated: Boolean(created.animated)
            });

            console.log(`Replaced emoji "${nameLocal.name}" (${remote.id})`);
        };

        continue;
    };

    const deleteRes = await deleteEmoji(remote);

    if (!deleteRes.ok) {
        console.error(`Failed to delete emoji ID ${remote.id} (${deleteRes.status} ${deleteRes.statusText}):`, await deleteRes.text());

        newMeta.push(meta);

        fails++;

        continue;
    };

    console.log(`Deleted emoji "${meta.name}" (${remote.id})`);
};

for (const local of localEmojis.filter(emoji => !processed.includes(emoji))) {
    const createRes = await createEmoji(local);

    if (!createRes.ok) {
        console.error(`Failed to create emoji "${local.name}" (${createRes.status} ${createRes.statusText}):`, await createRes.text());

        fails++;

        continue;
    };

    const created = await createRes.json();

    newMeta.push({
        id: created.id,
        name: local.name,
        path: local.path,
        hash: local.hash,
        animated: Boolean(created.animated)
    });

    console.log(`Created new emoji "${local.name}" (${created.id})`);
};

console.log('Updating cached emojis...');

await writeFile(CACHE_FILE, JSON.stringify({ version: 1, emojis: newMeta }));

console.log('Generating emoji enum...');

let enumContent = `export enum Emoji {\n`;

for (const meta of newMeta) {
    enumContent += `\t${meta.name} = '<${meta.animated ? 'a' : ''}:${meta.id}>',\n`;
};

enumContent += `};\n`;

await writeFile(ENUM_FILE, enumContent);

console.log(`Synced ${newMeta.length} emojis. Fail count: ${fails}`);
