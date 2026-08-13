import { redirect } from 'next/navigation'

export default function DemoPage() {
  redirect('/?type=demo#iletisim')
}
