export type DownloadSource = 'home' | 'indir'

export function trackDownload(source: DownloadSource) {
  const url = '/api/gibtebligat/download-track'
  const body = JSON.stringify({ source })

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(url, blob)) return
    }
  } catch {
    // The download still proceeds.
  }

  void fetch(url, {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
    keepalive: true,
  }).catch(() => undefined)
}
