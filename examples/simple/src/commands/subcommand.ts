import { CommandWithSubcommands } from '@httpi/client';

import {
   ApplicationIntegrationType,
   InteractionContextType,
} from 'discord-api-types/v10';

import { default as groupSubcommand } from './subcommand/group';
import { default as optionsSubcommand } from './subcommand/options';

export default new CommandWithSubcommands({
   data: {
      name: 'subcommand',
      description: 'This is a command with subcommands',
      integration_types: [
         ApplicationIntegrationType.GuildInstall,
         ApplicationIntegrationType.UserInstall,
      ],
      contexts: [
         InteractionContextType.Guild,
         InteractionContextType.BotDM,
         InteractionContextType.PrivateChannel,
      ],
   },
   subcommands: [groupSubcommand, optionsSubcommand],
});
