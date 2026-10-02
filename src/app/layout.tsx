import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://elite-focus-platform.vercel.app'),
  title: { default: 'Elite Focus', template: '%s | Elite Focus' },
  description: 'Tu espacio para aprender, avanzar y construir con claridad.',
  openGraph: {
    title: 'Elite Focus',
    description: 'Tu espacio para aprender, avanzar y construir con claridad.',
    url: 'https://elite-focus-platform.vercel.app',
    siteName: 'Elite Focus',
    images: [{ url: '/og-elite-focus.png', width: 1200, height: 630, alt: 'Elite Focus' }],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elite Focus',
    description: 'Tu espacio para aprender, avanzar y construir con claridad.',
    images: ['/og-elite-focus.png'],
  },
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
