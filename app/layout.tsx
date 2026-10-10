import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import { KEYS } from '@/lib/persist';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

// Latin subsets of Neue Kabel as WOFF2, about a fifth of the OTF weight. No 500: nothing renders it.
const kabel = localFont({
  src: [
    { path: './fonts/NeueKabel-Book.woff2', weight: '400', style: 'normal' },
    { path: './fonts/NeueKabel-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/NeueKabel-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-kabel',
  display: 'swap',
});

const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jb', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.shortName,
  publisher: SITE.company,
  category: 'food & drink',
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

export const viewport: Viewport = { themeColor: SITE.cream, colorScheme: 'light' };

// Runs before first paint: a returning visitor who already passed the age gate never sees it flash in.
const gateScript = `try{if(localStorage.getItem(${JSON.stringify(KEYS.age)})==='1')document.documentElement.dataset.ageOk=''}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kabel.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: gateScript }} />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
