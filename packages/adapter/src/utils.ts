import { Readable } from 'node:stream';

import type {
   CustomAPIInteractionResponse,
   CustomAPIInteractionResponseCallbackData,
} from '@httpi/client';

import type { RESTAPIAttachment } from 'discord-api-types/v10';

export function createInteractionAttachmentFormData(
   message: CustomAPIInteractionResponse,
   data: CustomAPIInteractionResponseCallbackData,
): { readable: Readable; headers: { 'content-type': string } } | undefined {
   if (!data.attachments?.length) return;

   const boundary =
      '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
   const formDataParts: Buffer[] = [];
   const messageAttachments: RESTAPIAttachment[] = [];

   for (const [id, attachment] of data.attachments.entries()) {
      if (!attachment) continue;

      messageAttachments.push({ id: id, filename: attachment.name });

      formDataParts.push(
         Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="files[${id}]"; filename="${attachment.name}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
         ),
         Buffer.from(attachment.data),
         Buffer.from('\r\n'),
      );
   }

   formDataParts.unshift(
      Buffer.from(
         `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n${JSON.stringify(
            {
               type: message.type,
               data: {
                  ...data,
                  attachments: messageAttachments,
               },
            },
         )}\r\n`,
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
