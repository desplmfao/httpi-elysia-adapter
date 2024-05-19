export default {
   WebsitePort: parseInt(process.env['WEBSITE_PORT'] ?? '0'),
   WebsiteClusters: parseInt(process.env['WEBSITE_CLUSTERS'] ?? '0'),

   DiscordClientId: String(process.env['DISCORD_CLIENT_ID']),
   DiscordPublicKey: String(process.env['DISCORD_PUBLIC_KEY']),
   DiscordToken: String(process.env['DISCORD_TOKEN']),
};
