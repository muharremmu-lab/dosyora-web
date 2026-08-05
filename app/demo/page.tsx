import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Demo',
  path: '/demo',
})

export default function DemoPage() {
  return <main />
}
