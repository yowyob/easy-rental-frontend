/** @type {import('next').NextConfig} */

const API_URL = process.env.API_URL || 'http://localhost:8081';

/** Préfixes consoles — doivent correspondre à getDynamicBaseUrl() dans api-client.ts */
const CONSOLE_API_PREFIXES = ['client', 'agency', 'organisation', 'admin'];

function buildApiRewrites(apiBaseUrl) {
  const rewrites = [
    {
      source: '/api-rental/:path*',
      destination: `${apiBaseUrl}/:path*`,
    },
    {
      source: '/uploads/:path*',
      destination: `${apiBaseUrl}/uploads/:path*`,
    },
    {
      source: '/api/media/kernel-file/:path*',
      destination: `${apiBaseUrl}/api/media/kernel-file/:path*`,
    },
  ];

  for (const prefix of CONSOLE_API_PREFIXES) {
    rewrites.push(
      {
        source: `/${prefix}/api-rental/:path*`,
        destination: `${apiBaseUrl}/:path*`,
      },
      {
        source: `/${prefix}/uploads/:path*`,
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
      {
        source: `/${prefix}/api/media/kernel-file/:path*`,
        destination: `${apiBaseUrl}/api/media/kernel-file/:path*`,
      }
    );
  }

  return rewrites;
}

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@pwa-easy-rental/shared-ui',
    '@pwa-easy-rental/shared-services',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return buildApiRewrites(API_URL);
  },
};

module.exports = nextConfig;
