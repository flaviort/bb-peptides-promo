import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Poppins } from 'next/font/google';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

// RBNo2.1 Medium Italic is a commercial licence: one self-hosted Latin woff2, never redistributed.
const rbno = localFont({
  src: [{ path: './fonts/rbno21a-medium-italic-latin.woff2', weight: '500', style: 'italic' }],
  variable: '--font-rbno',
  display: 'swap',
});

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.shortName,
  publisher: SITE.company,
  category: 'health',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = { themeColor: SITE.ink, colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rbno.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
