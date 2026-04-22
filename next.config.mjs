/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_OAUTH_TOKEN: process.env.TWITCH_OAUTH_TOKEN,
    SOCKET_NONCE: process.env.SOCKET_NONCE,
    SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD,
    TWITCH_CHANNEL_NAME: process.env.TWITCH_CHANNEL_NAME,
    TWITCH_CHANNEL_ID: process.env.TWITCH_CHANNEL_ID,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
  },
}

export default nextConfig
