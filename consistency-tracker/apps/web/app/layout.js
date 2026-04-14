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
      <body className="font-body text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}