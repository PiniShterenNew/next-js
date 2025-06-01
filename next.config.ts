import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

// Configure next-intl plugin with default settings
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Configure rewrites to handle API routes with locale prefixes
  async rewrites() {
    return [
      // Rewrite API routes when accessed with locale prefix
      {
        source: '/:locale/api/:path*',
        destination: '/api/:path*',
      },
      // Rewrite dynamic routes with IDs when accessed with locale prefix
      {
        source: '/:locale/dashboard/invoices/:id*',
        destination: '/:locale/dashboard/invoices/:id*',
      },
      {
        source: '/:locale/dashboard/customers/:id*',
        destination: '/:locale/dashboard/customers/:id*',
      },
      // Additional rewrites for other paths if needed
      {
        source: '/:locale/dashboard/settings',
        destination: '/:locale/dashboard/settings',
      },
      {
        source: '/:locale/dashboard/notifications',
        destination: '/:locale/dashboard/notifications',
      }
    ];
  }
};

export default withNextIntl(nextConfig);
