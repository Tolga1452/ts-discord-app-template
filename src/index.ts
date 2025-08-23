import { Client } from 'discord.js';
import { config } from 'dotenv';
import events from './utils/events.js';

config();

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

client.login(process.env.DISCORD_TOKEN);
