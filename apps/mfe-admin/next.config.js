/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/admin',
  trailingSlash: false,
  transpilePackages: ['@pwa-easy-rental/shared-ui', '@pwa-easy-rental/shared-services'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api-rental/:path*',
        destination: 'http://localhost:8081/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
