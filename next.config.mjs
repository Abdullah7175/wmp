/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://wmp.kwsc.gos.pk:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production',
    JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wmp.kwsc.gos.pk',
      },
      {
        protocol: 'http',
        hostname: 'wmp.kwsc.gos.pk',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '119.30.113.18',
        port: '3000',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: true, // Enable server actions in Next.js 13
  },
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