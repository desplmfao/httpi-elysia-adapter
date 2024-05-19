/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-async-promise-executor */
import { default as crypto } from 'node:crypto';

import { type Context } from 'elysia';

import type {
   BaseInteraction,
   Events,
   CustomAPIInteractionResponseCallbackData,
} from '@httpi/client';

import { verify } from 'discord-verify/node';

import { createInteractionAttachmentFormData } from './utils';

/**
 * Create an Elysia middleware for HTTP interactions
 * @param opts The public key and events
 * @returns The middleware
 */
export function createAdapter(opts: { publicKey: string; events: Events }) {
   return async (ctx: Context) => {
      const signature = ctx.request.headers.get('X-Signature-Ed25519');
      const timestamp = ctx.request.headers.get('X-Signature-Timestamp');

      const interaction = (await ctx.request.json()) as BaseInteraction;

      return new Promise(async (resolve) => {
         try {
            const isValid = await verify(
               JSON.stringify(interaction),
               signature,
               timestamp,
               opts.publicKey,
               crypto.webcrypto.subtle,
            );

            if (!isValid) {
               ctx.set = {
                  headers: { ...ctx.set.headers },
                  status: 401,
               };
               return resolve('Invalid signature');
            }

            const eventHandler = opts.events[interaction.type];
            if (!eventHandler) {
               ctx.set = {
                  headers: { ...ctx.set.headers },
                  status: 400,
               };
               return resolve('Unknown interaction type');
            }

            const response = await eventHandler.execute({
               interaction,
               user: interaction.member?.user ?? interaction.user,
               // eslint-disable-next-line @typescript-eslint/require-await
               respond: async (message) => {
                  const data =
                     // @ts-expect-error
                     message?.data as CustomAPIInteractionResponseCallbackData;

                  if (data.attachments) {
                     const formData = createInteractionAttachmentFormData(
                        message,
                        data,
                     );
                     if (formData == null) return resolve('Error');

                     ctx.set = {
                        // @ts-expect-error
                        headers: {
                           ...ctx.set.headers,
                           'content-type': formData.headers['content-type'],
                        },
                     };

                     return resolve(formData.readable);
                  }

                  return resolve(message);
               },
            });

            return resolve(response);
         } catch (err) {
            console.error(err);
            return resolve('Error');
         }
      });
   };
}
