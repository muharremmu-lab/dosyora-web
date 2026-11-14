'use client'

import type { ReactNode } from 'react'

import { desktopDownloadHref } from './desktop-download-section'
import { trackDownload, type DownloadSource } from './track-download'

type DownloadAnchorProps = {
  source: DownloadSource
  className?: string
  children: ReactNode
}

export function DownloadAnchor({ source, className, children }: DownloadAnchorProps) {
  return (
    <a href={desktopDownloadHref} download onClick={() => trackDownload(source)} className={className}>
      {children}
    </a>
  )
}
