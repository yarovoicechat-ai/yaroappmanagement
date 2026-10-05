import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.darkmoon.app',
      },
      {
        protocol: 'https',
        hostname: 'darkmoon.app',
      },
    ],
  },
  allowedDevOrigins: [
    'https://danilo-syngamic-unterrifically.ngrok-free.dev'
  ],
};

export default nextConfig;
