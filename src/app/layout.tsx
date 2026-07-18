import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import LoaderIntro from '@/components/LoaderIntro';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmokeBackground from '@/components/SmokeBackground';
import GoldSparkles from '@/components/GoldSparkles';
import ChatWidget from '@/components/ChatWidget';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '500', '600', '700', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ink-tells-your-story.vercel.app'),
  title: 'Obsidian Ink Studio — Premium Custom Tattoo Art & Booking',
  description:
    'Obsidian Ink Studio is a high-end tattoo gallery and booking experience. Explore black & grey, realism, anime, traditional, fine line, minimalist, cover-up, and custom tattoo portfolios, then book your session online.',
  keywords: [
    'tattoo studio',
    'custom tattoo',
    'realism tattoo',
    'fine line tattoo',
    'tattoo booking',
    'tattoo portfolio',
    'cover up tattoo',
  ],
  openGraph: {
    title: 'Obsidian Ink Studio — Ink That Tells Your Story',
    description: 'A cinematic digital gallery and booking experience for premium custom tattoo art.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="grunge-texture font-body antialiased text-white overflow-x-hidden">
        <LoaderIntro />
        <CustomCursor />
        <SmokeBackground />
        <GoldSparkles />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
