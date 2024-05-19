import { API } from '@discordjs/core';
import { REST } from '@discordjs/rest';

import { default as env } from '@/env';

export const rest = new REST({ version: '10' }).setToken(env.DiscordToken);
export const discord = new API(rest);
