/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    domains: ['placehold.co', 'localhost', 'vercel.app', 'vercel.com'],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'localhost:3001', 
        'localhost:3002', 
        'localhost:3003', 
        'localhost:3004',
        '*.vercel.app',
        '*.vercel.com'
      ],
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