import { Client } from 'discord.js';
import events from './utils/events.js';

const client = new Client({
    allowedMentions: {
        parse: [],
        repliedUser: false
    },
    intents: []
});

for (const event in events) {
    client.on(event, events[event].execute);
};

client.login(process.env.DISCORD_BOT_TOKEN);
