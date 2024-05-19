import { createEvents } from '@httpi/client';
import { createStandaloneClient } from '@httpi/adapter-elysia';

import { default as env } from '@/env';

import { default as commands } from '../utils/commands';
import { default as components } from '../utils/components';

createStandaloneClient({
   port: env.WebsitePort,
   publicKey: env.DiscordPublicKey,
   events: createEvents({
      commands,
      components,
   }),
});
