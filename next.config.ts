import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mithichat.live',
      },
    ],
  },
  allowedDevOrigins: [
    'https://danilo-syngamic-unterrifically.ngrok-free.dev'
  ],
};

export default nextConfig;
