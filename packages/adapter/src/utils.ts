import { createPublicKey, verify } from 'node:crypto';
import { Readable } from 'node:stream';

import type {
   CustomAPIInteractionResponse,
   CustomAPIInteractionResponseCallbackData,
} from '@httpi/client';

import type { RESTAPIAttachment } from 'discord-api-types/v10';

/**
 * Creates a form data object for interaction attachments.
 *
 * This function generates a `multipart/form-data` payload for the attachments included in the interaction response.
 * It returns a readable stream of the form data and the appropriate headers.
 *
 * @param message - The interaction response message.
 * @param data - The callback data for the interaction response.
 * @returns An object containing a readable stream and headers for the form data, or undefined if there are no attachments.
 */
export function createInteractionAttachmentFormData(
   message: CustomAPIInteractionResponse,
   data: CustomAPIInteractionResponseCallbackData,
): { readable: Readable; headers: { 'content-type': string } } | undefined {
   if (!data.attachments?.length) return;

   const boundary =
      '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
   const disposition = `--${boundary}\r\nContent-Disposition: form-data;`;
   const formDataParts: Buffer[] = [];
   const messageAttachments: RESTAPIAttachment[] = [];

   for (const [id, attachment] of data.attachments.entries()) {
      if (!attachment) continue;

      messageAttachments.push({ id: id, filename: attachment.name });

      formDataParts.push(
         Buffer.from(
            `${disposition} name="files[${id}]"; filename="${attachment.name}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
         ),
         Buffer.from(attachment.data),
         Buffer.from('\r\n'),
      );
   }

   formDataParts.unshift(
      Buffer.from(
         `${disposition} name="payload_json"\r\n\r\n${JSON.stringify({
            type: message.type,
            data: {
               ...data,
               attachments: messageAttachments,
            },
         })}\r\n`,
      ),
   );

   const formData = Buffer.concat([
      ...formDataParts,
      Buffer.from(`--${boundary}--\r\n`),
   ]);

   return {
      readable: Readable.from(formData),
      headers: {
         'content-type': `multipart/form-data; boundary=${boundary}`,
      },
   };
}

// https://github.com/ssMMiles/discord-interactions/blob/main/packages/verify/src/node.ts

/**
 * Verify an incoming interaction's signature.
 * @param publicKey Your Application's Public Key
 * @param timestamp Interaction Request's "X-Signature-Timestamp" Header
 * @param signature Interaction Request's "X-Signature-Ed25519" Header
 * @param body Raw Interaction Request Body - If you parse this as JSON beforehand, verification will fail for certain interactions.
 * @returns Whether or not the signature is valid.
 */
export default function verifyInteractionSignature(
   publicKey: string,
   signature: string | null,
   timestamp: string | null,
   body: string,
): boolean {
   const message = Buffer.from(timestamp + body, 'utf-8');
   const signatureBuffer = Buffer.from(signature ?? '', 'hex');

   return verify(
      null,
      message,
      createPublicKey({
         key: Buffer.concat([
            Buffer.from('MCowBQYDK2VwAyEA', 'base64'),
            Buffer.from(publicKey, 'hex'),
         ]),
         format: 'der',
         type: 'spki',
      }),
      signatureBuffer,
   );
}
