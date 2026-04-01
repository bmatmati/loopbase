import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Loopbase — Free Crochet Patterns',
  description: 'Find hundreds of free crochet tutorials in one place. Filter by difficulty, time and format. Always free, forever.',
  icons: {
  icon: '/favicon.svg',
  apple: '/favicon.svg',
} apple: '/logo.png',
  },
  openGraph: {
    title: 'Loopbase — Free Crochet Patterns',
    description: 'Find hundreds of free crochet tutorials in one place.',
    url: 'https://loopbase.uk',
    siteName: 'Loopbase',
    images: [{ url: '/logo.png' }],
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
