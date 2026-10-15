import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fredoka } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const fredoka = Fredoka({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Perpustakaan KB-TK SBTH Magelang - Be Smart, Be Kind',
  description:
    'Sistem manajemen perpustakaan ceria ramah anak KB-TK Bhakti Tunas Harapan (SBTH) Magelang dengan katalog visual, barcode scanner USB/kamera, dan pencarian otomatis ISBN.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

