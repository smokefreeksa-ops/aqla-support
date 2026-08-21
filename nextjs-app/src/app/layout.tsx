import type { Metadata } from 'next'
import './globals.css'
import './study-invitation-v2.css'
import './study-invitation-backdrop.css'
import './quit-engine.css'
import './followup.css'
import './plan-print.css'
import './accessibility.css'
import './experience.css'
import './os.css'
import './admin.css'
import './engagement.css'
import './aqla-institutional.css'
import './aqla-theme-overrides.css'
import './assessment-form-clarity.css'
import './assessment-v4.css'

const appUrl = process.env.AQLA_APP_URL || 'https://staging.smokefreeksa.com'
const title = 'أقلع — Aqla'
const description = 'منصة أقلع لدعم الإقلاع عن التدخين والنيكوتين بخطة شخصية وتقييم تكيفي وأدوات دعم عملية.'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'Aqla — أقلع',
  title,
  description,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title,
    description,
    siteName: 'Aqla — أقلع',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_GB'],
    images: [
      {
        url: '/aqla-logo.png',
        width: 400,
        height: 225,
        alt: 'Aqla — أقلع',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/aqla-logo.png'],
  },
  icons: {
    icon: '/aqla-logo.png',
    apple: '/aqla-logo.png',
  },
}

const displayModeScript = `(function(){try{var mode=localStorage.getItem('aqla_display_mode');document.documentElement.dataset.aqlaTheme=(mode==='light'||mode==='dim'||mode==='night')?mode:'night';}catch(e){document.documentElement.dataset.aqlaTheme='night';}})();`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-aqla-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: displayModeScript }} />
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
