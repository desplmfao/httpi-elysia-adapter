import { createPublicKey, verify } from 'node:crypto';

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
