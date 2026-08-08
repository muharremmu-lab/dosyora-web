import type { NextConfig } from 'next'

import { buildSecurityHeaders } from '@/lib/security/headers'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/og-image.jpg',
        destination: '/opengraph-image',
      },
    ]
  },
  async headers() {
    const securityHeaders = buildSecurityHeaders(process.env.NODE_ENV === 'production')

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
