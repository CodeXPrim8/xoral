import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/AuthProvider'
import { CatalogProvider } from '@/components/CatalogProvider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'XORAL — Premium AI Cinema',
  description: 'Stream AI-powered cinema on XORAL. Trending movies, exclusive AI-generated originals, and virtual AI Stars across every screen.',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050308',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <Script src="/sw-kill.js" strategy="beforeInteractive" />
        <AuthProvider>
          <CatalogProvider>
            {children}
          </CatalogProvider>
        </AuthProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
