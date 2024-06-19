import type { Context } from 'elysia';

import type { BaseInteraction, Events, InteractionEnv } from '@httpi/client';

import verifyInteractionSignature from './utils';
import { createMultipartResponse } from '@httpi/utils';

/**
 * Create an Elysia middleware for HTTP interactions
 * @param opts The public key and events
 * @returns The middleware
 */
export async function handleRequest({
   autoResolve = true,
   env,
   publicKey,
   events,
   ctx,
}: {
   autoResolve?: boolean;
   env?: InteractionEnv;
   publicKey: string;
   events: Events;
   ctx: Context;
}): Promise<Response> {
   const signature = ctx.request.headers.get('X-Signature-Ed25519');
   const timestamp = ctx.request.headers.get('X-Signature-Timestamp');

   const body = await ctx.request.text();
   const interaction = JSON.parse(body) as BaseInteraction;

   const is_valid = verifyInteractionSignature(publicKey, signature, timestamp, body);
   if (!is_valid) return new Response('Invalid signature', { status: 401 });

   const event_handler = events[interaction.type];
   if (!event_handler) return new Response('Unknown interaction type', { status: 400 });

   let resolved = false;
   return new Promise((resolve) => {
      // no idea what this does but its in all the official adapters so there isn't a reason to not include it lol
      const resolved_timeout = autoResolve
         ? setTimeout(() => {
              resolved = true;
              return resolve(new Response());
           }, 3000)
         : null;

      event_handler.execute({
         env: env ?? process.env,
         interaction,
         user: interaction.member?.user ?? interaction.user,
         async respond(message) {
            if (resolved) return null;
            if (resolved_timeout) clearTimeout(resolved_timeout);
            resolved = true;

            // @ts-ignore If message.data.attachments isn't a value, the message doesn't have attachments
            if (!message?.data?.attachments?.length) {
               return resolve(
                  new Response(JSON.stringify(message), {
                     headers: {
                        'content-type': 'application/json',
                     },
                  }),
               );
            }

            // Create attachment response
            // This is where the FormData and boundary is given
            const { formData, boundary } = createMultipartResponse(message);

            // Responds with attachments (multipart/form-data)
            return resolve(
               new Response(formData, {
                  headers: {
                     'content-type': `multipart/form-data; boundary=${boundary}`,
                  },
               }),
            );
         },
      });
   });
}
