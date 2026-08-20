import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MenuQ — Digital QR Menu for Restaurants',
  description:
    'Give your restaurant a QR menu that lets customers order directly. No app download. No commission. Just ₹299/month.',
  keywords: 'QR menu, restaurant menu, digital menu, restaurant ordering, Indian restaurant',
  openGraph: {
    title: 'MenuQ — Digital Menu & Ordering for Restaurants',
    description: 'Pay ₹299/month. QR menu → instant orders to your kitchen. Zero commission.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

