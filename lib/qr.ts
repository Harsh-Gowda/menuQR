import QRCode from 'qrcode'

export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  })
}

export function getMenuURL(slug: string, tableNumber?: string): string {
  const base = process.env.NEXT_PUBLIC_MENU_BASE_URL || 'http://localhost:3000'
  return tableNumber
    ? `${base}/menu/${slug}/${tableNumber}`
    : `${base}/menu/${slug}`
}
