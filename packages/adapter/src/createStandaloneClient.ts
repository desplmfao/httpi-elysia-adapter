import { default as Elysia } from 'elysia';
import type { Events } from '@httpi/client';

import { createAdapter } from './createAdapter';

/**
 * Start the bot using a standalone web server
 * @param data The client data
 */
export function createStandaloneClient({
   port,
   publicKey,
   events,
}: {
   port: number;
   publicKey: string;
   events: Events;
}) {
   const app = new Elysia();

   app.get('/interactions', () => {
      return 'Hello from the Elysia standalone client for httpi';
   });

   app.post(
      '/interactions',
      createAdapter({
         publicKey,
         events,
      }),
   );

   app.listen(port);
}
