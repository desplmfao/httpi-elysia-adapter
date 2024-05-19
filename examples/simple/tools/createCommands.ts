import { createCommands } from '@httpi/client';

import { default as env } from '@/env';

import { default as commands } from '../src/utils/commands';

const result = await createCommands({
   id: env.DiscordClientId,
   token: env.DiscordToken,
   commands,
});

console.log(result);

process.exit();
