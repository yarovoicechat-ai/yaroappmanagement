import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.voicecallclub.com',
      },
    ],
  },
  allowedDevOrigins: [
    'https://danilo-syngamic-unterrifically.ngrok-free.dev'
  ],
};

export default nextConfig;
