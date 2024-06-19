import process from 'node:process';

import { createCommands } from '@httpi/client';
import commands from './commands';

const result = await createCommands({
   id: process.env['DISCORD_CLIENT_ID'] as string,
   token: process.env['DISCORD_TOKEN'] as string,
   commands,
});

console.log(result);
