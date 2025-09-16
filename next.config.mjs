/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://202.61.47.29:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '202.61.47.29',
        port: '3000',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'localhost:3003', 'localhost:3004', '202.61.47.29:3000'],
    },
  },
  serverExternalPackages: ['sharp', 'fs-extra'],
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      stream: false, 
      constants: false 
    };
    return config;
  },
};

export default nextConfig;