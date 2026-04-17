import './globals.css';
import { Manrope, Space_Grotesk } from 'next/font/google';
import Providers from '@/components/layout/Providers';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'GoalTracker',
  description: 'GoalTracker helps you track goals, stopwatch sessions, consistency, and analytics in one polished dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="GoalTracker" />
        <meta name="apple-mobile-web-app-title" content="GoalTracker" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'GoalTracker',
              url: 'https://goaltracker.tech',
              logo: 'https://goaltracker.tech/favicon.ico',
            }),
          }}
        />
      </head>
      <body className="font-body text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}