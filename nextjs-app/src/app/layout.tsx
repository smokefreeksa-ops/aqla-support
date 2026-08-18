import type { Metadata } from 'next'
import './globals.css'
import './quit-engine.css'

export const metadata: Metadata = {
  title: 'أقلع — AQla',
  description: 'منصة أقلع لدعم الإقلاع عن التدخين والنيكوتين',
  icons: {
    icon: 'https://aqla1.com/aqla-logo.png',
    apple: 'https://aqla1.com/aqla-logo.png',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
