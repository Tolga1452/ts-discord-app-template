import { ClientEvents } from 'discord.js';
import { GatewayEvent } from '../types/index.js';

import clientReady from '../events/clientReady.js';
import interactionCreate from '../events/interactionCreate.js';

export default { clientReady, interactionCreate } as Partial<Record<keyof ClientEvents, GatewayEvent>>;
