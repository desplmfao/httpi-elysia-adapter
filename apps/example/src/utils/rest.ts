import { createRestManager } from '@discordeno/rest';

import { default as env } from '@/env';

export const rest = createRestManager({ token: env.DiscordToken });
