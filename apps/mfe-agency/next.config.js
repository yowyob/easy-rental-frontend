/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/agency',
  trailingSlash: false,
  transpilePackages: ['@pwa-easy-rental/shared-ui', '@pwa-easy-rental/shared-services'],
  async rewrites() {
    return [
      {
        // On redirige tous les appels /api-rental vers le vrai serveur Render
        source: '/api-rental/:path*',
        destination: 'http://localhost:8081/:path*',
      },
    ];
  },
};

module.exports = nextConfig;