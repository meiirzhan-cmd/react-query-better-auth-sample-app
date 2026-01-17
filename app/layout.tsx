import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Inbox Zero - AI-Powered Email Management",
    template: "%s | Inbox Zero",
  },
  description:
    "Reduce email overload with AI-powered summaries, smart labels, and daily digests. Achieve inbox zero effortlessly.",
  keywords: [
    "email management",
    "inbox zero",
    "AI email",
    "email productivity",
    "email summarizer",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inboxzero.app",
    siteName: "Inbox Zero",
    title: "Inbox Zero - AI-Powered Email Management",
    description:
      "Reduce email overload with AI-powered summaries and smart organization.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inbox Zero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inbox Zero - AI-Powered Email Management",
    description:
      "Reduce email overload with AI-powered summaries and smart organization.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
