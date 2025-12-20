/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  // Empty turbopack config to silence the warning when using webpack config
  turbopack: {},
  // Removed rewrite - Next.js serves files from public/ directly
  // Files in public/uploads/ will be accessible at /uploads/
  // async rewrites() {
  //   return [
  //     {
  //       source: '/uploads/:path*',
  //       destination: '/api/uploads/:path*',
  //     },
  //   ];
  // },
  env: {
    // Use HTTPS in production, HTTP only for local development
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://wmp.kwsc.gos.pk' : 'http://wmp.kwsc.gos.pk:3000'),
    // SECURITY: No default secrets - must be set in environment variables
    NEXTAUTH_SECRET: (() => {
      if (!process.env.NEXTAUTH_SECRET) {
        throw new Error('NEXTAUTH_SECRET must be set in environment variables');
      }
      return process.env.NEXTAUTH_SECRET;
    })(),
    JWT_SECRET: (() => {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be set in environment variables');
      }
      return process.env.JWT_SECRET;
    })(),
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
  // SECURITY: Add security headers
  async headers() {
    return [
      {
        // Allow PDFs to be displayed in iframes (SAMEORIGIN allows same-origin embedding)
        source: '/api/uploads/:path*.pdf',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Content-Type',
            value: 'application/pdf'
          }
        ]
      },
      {
        // Default security headers for all other routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'self';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
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