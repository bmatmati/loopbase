import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://loopbase.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Loopbase — Free Crochet Patterns",
    template: "%s | Loopbase",
  },
  description: "Find hundreds of free crochet tutorials in one place. Filter by difficulty, time and format. Always free, forever.",
  keywords: ["free crochet patterns", "crochet tutorials", "beginner crochet", "amigurumi", "crochet garments"],
  authors: [{ name: "Loopbase" }],
  creator: "Loopbase",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Loopbase — Free Crochet Patterns",
    description: "Find hundreds of free crochet tutorials in one place. Always free, forever.",
    url: siteUrl,
    siteName: "Loopbase",
    images: [{ url: "/logo.svg", width: 500, height: 500, alt: "Loopbase" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loopbase — Free Crochet Patterns",
    description: "Find hundreds of free crochet tutorials in one place. Always free, forever.",
    images: ["/logo.svg"],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
