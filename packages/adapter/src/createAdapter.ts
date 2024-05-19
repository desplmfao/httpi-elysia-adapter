import crypto from 'node:crypto';
import { Readable } from 'node:stream';

import { type Context } from 'elysia';

import type {
   BaseInteraction,
   InteractionResponseAttachment,
   Events,
} from '@httpi/client';

import { verify } from 'discord-verify/node';
import type { RESTAPIAttachment } from 'discord-api-types/v10';

import { FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';

/**
 * Create a Elysia middleware for HTTP interactions
 * @param opts The public key and events
 * @returns The middleware
 */
export function createAdapter(opts: { publicKey: string; events: Events }) {
   return async (ctx: Context) => {
      // Validates if the interaction is coming from Discord
      const signature = ctx.request.headers.get('X-Signature-Ed25519');
      const timestamp = ctx.request.headers.get('X-Signature-Timestamp');

      const body = await ctx.request.text();

      try {
         // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
         return await new Promise(async (resolve) => {
            const isValid = await verify(
               body,
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

            // Handles interactions
            const interaction = JSON.parse(body) as BaseInteraction;

            return opts.events[interaction.type]?.execute({
               interaction,
               user: interaction.member?.user ?? interaction.user,
               // eslint-disable-next-line @typescript-eslint/require-await
               respond: async (message) => {
                  // @ts-expect-error If message.data.attachments is a value, the message has attachments
                  if (message?.data?.attachments) {
                     // @ts-expect-error Create the form data
                     const attachments = message?.data
                        ?.attachments as InteractionResponseAttachment[];
                     const formData = new FormData();

                     // Create an updated message attachments object
                     const messageAttachments: RESTAPIAttachment[] = [];
                     for (let id = 0; id < attachments.length; ++id) {
                        messageAttachments.push({
                           id,
                           filename: attachments[id]?.name,
                        });
                     }

                     // Append the JSON body
                     formData.append(
                        'payload_json',
                        JSON.stringify({
                           type: message.type,
                           data: {
                              // @ts-expect-error
                              ...message.data,
                              attachments: messageAttachments,
                           },
                        }),
                     );

                     // Append the files
                     for (let i = 0; i < attachments.length; ++i) {
                        formData.append(
                           `files[${i}]`,
                           new Blob([attachments[i]?.data]),
                        );
                     }

                     // Create the encoder and readable
                     const encoder = new FormDataEncoder(formData);
                     const readable = Readable.from(encoder);

                     // Sets the correct headers
                     ctx.set = {
                        // @ts-expect-error
                        headers: {
                           ...ctx.set.headers,
                           'content-type': encoder.headers['content-type'],
                        },
                     };

                     // Responds with attachments (multipart/form-data)
                     return resolve(readable);
                  }

                  // Responds normally (application/json)
                  return resolve(message);
               },
            });
         });
      } catch (err) {
         console.error(err);

         return 'Error';
      }
   };
}
