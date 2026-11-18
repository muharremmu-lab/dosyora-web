import { jsonOk } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return jsonOk({
    version: '1.1.19',
    url: 'https://www.dosyora.com/downloads/gibtebligat/GibTebligatPro-Kurulum.exe',
    critical: false,
  })
}
