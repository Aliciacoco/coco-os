import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // frontend/next.config.ts
async rewrites() {
  return [
    {
      source: '/api/ai',
      destination: 'http://localhost:3000/api/ai',
    }
  ];
}
};

export default nextConfig;
