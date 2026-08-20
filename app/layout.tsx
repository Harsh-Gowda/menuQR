import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MenuQR.in — Digital QR Menu for Indian Restaurants',
  description:
    'Give your restaurant a QR menu that lets customers order via WhatsApp. No app download. No Swiggy/Zomato commission. Just ₹299/month.',
  keywords: 'QR menu, restaurant menu, WhatsApp ordering, Indian restaurant, digital menu',
  openGraph: {
    title: 'MenuQR.in — Stop paying Swiggy ₹15,000/month',
    description: 'Pay ₹299 instead. QR menu → WhatsApp orders. Zero commission.',
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

