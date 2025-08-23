import { ClientEvents } from 'discord.js';
import { GatewayEvent } from '../types/index.js';

import interactionCreate from '../events/interactionCreate.js';
import ready from '../events/ready.js';

export default { interactionCreate, ready } satisfies Partial<Record<keyof ClientEvents, GatewayEvent>>;
