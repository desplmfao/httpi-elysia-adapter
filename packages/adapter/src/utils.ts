import { Readable } from 'node:stream';

import type {
   CustomAPIInteractionResponse,
   CustomAPIInteractionResponseCallbackData,
} from '@httpi/client';

import type { RESTAPIAttachment } from 'discord-api-types/v10';

export function createInteractionAttachmentFormData(
   message: CustomAPIInteractionResponse,
   data: CustomAPIInteractionResponseCallbackData,
):
   | {
        readable: Readable;
        headers: {
           'content-type': string;
        };
     }
   | undefined {
   if (!data.attachments || data.attachments.length === 0) return;

   const boundary =
      '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
   const formDataParts: Buffer[] = [];
   const messageAttachments: RESTAPIAttachment[] = [];

   for (const index in data.attachments) {
      if (Object.prototype.hasOwnProperty.call(data.attachments, index)) {
         const id = parseInt(index);
         const attachment = data.attachments[id];

         messageAttachments.push({
            id,
            filename: attachment?.name,
         });
      }
   }

   const payloadJson = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n${JSON.stringify(
         {
            type: message.type,
            data: {
               ...data,
               attachments: messageAttachments,
            },
         },
      )}\r\n`,
   );

   formDataParts.push(payloadJson);

   for (const index in data.attachments) {
      if (Object.prototype.hasOwnProperty.call(data.attachments, index)) {
         const id = parseInt(index);
         const attachment = data.attachments[id];
         const fileHeader = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="files[${id}]"; filename="${attachment?.name}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
         );
         const fileFooter = Buffer.from('\r\n');

         // Combine file header, data, and footer
         const fileData = Buffer.concat([
            fileHeader,
            Buffer.from(attachment?.data),
            fileFooter,
         ]);

         formDataParts.push(fileData);
      }
   }

   formDataParts.push(Buffer.from(`--${boundary}--`));

   return {
      readable: Readable.from(Buffer.concat(formDataParts)),
      headers: {
         'content-type': `multipart/form-data; boundary=${boundary}`,
      },
   };
}
