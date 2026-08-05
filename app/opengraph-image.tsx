import { ImageResponse } from 'next/og'

import { siteConfig } from '@/lib/site'

export const alt = siteConfig.name
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: '#0f172a',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>{siteConfig.name}</div>
        <div style={{ marginTop: 16, fontSize: 28, opacity: 0.85 }}>{siteConfig.description}</div>
      </div>
    ),
    size,
  )
}
