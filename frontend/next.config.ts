import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@vladmandic/face-api'],
  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
};

export default nextConfig;
