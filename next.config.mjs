/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_ACCESS_TOKEN: process.env.TWITCH_ACCESS_TOKEN,
  },
};

export default nextConfig;
