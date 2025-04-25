/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITCH_OAUTH_TOKEN: process.env.TWITCH_OAUTH_TOKEN,
    SOCKET_NONCE: process.env.SOCKET_NONCE,
    TWITCH_ACCESS_TOKEN: process.env.TWITCH_ACCESS_TOKEN,
    SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD,
    TWITCH_CHANNEL_NAME: process.env.TWITCH_CHANNEL_NAME,
    TWITCH_CHANNEL_ID: process.env.TWITCH_CHANNEL_ID,
  },
}

export default nextConfig
