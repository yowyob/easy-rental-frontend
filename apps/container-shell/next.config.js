/** @type {import('next').NextConfig} */

const ORG_URL = process.env.NEXT_PUBLIC_ORG_URL || 'http://localhost:3003';
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001';
const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL || 'http://localhost:3002';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3004';
// const APP_URL = process.env.NEXT_PUBLIC_ORG_URL || 'https://pwa-easy-rental-app.vercel.app';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pwa-easy-rental/shared-ui', '@pwa-easy-rental/shared-services'],
  async rewrites() {
    return [
      {
        source: '/api-rental/:path*',
        destination: 'http://localhost:8081/:path*',
      },
      // MFE CLIENT
      {
        source: '/client',
        destination: `${CLIENT_URL}/client`,
      },
      {
        source: '/client/:path*',
        destination: `${CLIENT_URL}/client/:path*`,
      },
      
      // MFE AGENCY
      {
        source: '/agency',
        destination: `${AGENCY_URL}/agency`,
      },
      {
        source: '/agency/:path*',
        destination: `${AGENCY_URL}/agency/:path*`,
      },
      
      // MFE ORGANISATION
      {
        source: '/organisation',
        destination: `${ORG_URL}/organisation`,
      },
      {
        source: '/organisation/:path*',
        destination: `${ORG_URL}/organisation/:path*`,
      },

      // MFE ADMIN
      {
        source: '/admin',
        destination: `${ADMIN_URL}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${ADMIN_URL}/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
