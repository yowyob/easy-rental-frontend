/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/client',
  trailingSlash: false,
  transpilePackages: ['@pwa-easy-rental/shared-ui', '@pwa-easy-rental/shared-services', '@pwa-easy-rental/shared-maps'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-rental/:path*',
        destination: 'http://localhost:8081/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8081/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;