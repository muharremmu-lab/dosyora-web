import type { NextConfig } from 'next'

import { buildSecurityHeaders } from '@/lib/security/headers'

const releaseFile = (name: string) =>
  `https://media.githubusercontent.com/media/muharremmu-lab/dosyora-web/master/public/downloads/gibtebligat/${name}`

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/downloads/gibtebligat/GibTebligatPro-Kurulum.exe',
        destination: releaseFile('GibTebligatPro-Kurulum.exe'),
        permanent: false,
      },
      {
        source: '/downloads/gibtebligat/GibTebligatPro.exe',
        destination: releaseFile('GibTebligatPro.exe'),
        permanent: false,
      },
    ]
  },
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
