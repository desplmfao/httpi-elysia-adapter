import { Elysia } from 'elysia';
import commands from './commands';
import { handleRequest } from '@httpi/adapter-elysia';
import { createEvents } from '@httpi/client';

const app = new Elysia();

app.get('/', () => `👋 ${process.env['DISCORD_CLIENT_ID']}`);

app.post(
   '/',
   async (ctx) =>
      await handleRequest({
         ctx,
         publicKey: String(process.env['DISCORD_PUBLIC_KEY']),
         events: createEvents({
            commands,
         }),
      }),
);

app.all('*', () => new Response('Not found', { status: 404 }));

app.listen({ port: process.env['WEBSITE_PORT'] }, () => {
   console.log(process.env['DISCORD_CLIENT_ID']);
});
