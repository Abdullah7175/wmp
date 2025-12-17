/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  // Empty turbopack config to silence the warning when using webpack config
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  env: {
    // Use HTTPS in production, HTTP only for local development
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://wmp.kwsc.gos.pk' : 'http://wmp.kwsc.gos.pk:3000'),
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
    // Disable image optimization if sharp is not available (fallback)
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
  },
  // Server Actions are stable in Next.js 16, no experimental flag needed
  webpack: (config, { isServer, webpack }) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      stream: false, 
      constants: false, 
      turbopack: false
    };
    
    // Ignore Cloudflare-specific modules that aren't needed in standard Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'pg-cloudflare': false,
    };
    
    // Ignore cloudflare:sockets using IgnorePlugin
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^cloudflare:sockets$/,
      })
    );
    
    return config;
  },
};

export default nextConfig;