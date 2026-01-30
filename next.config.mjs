/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_OAUTH_TOKEN: process.env.TWITCH_OAUTH_TOKEN,
    SOCKET_NONCE: process.env.SOCKET_NONCE,
    SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD,
    TWITCH_CHANNEL_NAME: process.env.TWITCH_CHANNEL_NAME,
    TWITCH_CHANNEL_ID: process.env.TWITCH_CHANNEL_ID,
  },
}

export default nextConfig
