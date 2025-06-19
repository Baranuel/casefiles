import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/global/Navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { Providers } from "@/providers";
import { Footer } from "@/components/global/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Casefiles",
    template: "%s | Casefiles"
  },
  description:
    "Casefiles is the ultimate collaborative detective board—organize clues, assign tasks, and solve cases together in real time.",
  keywords: [
    "detective cases",
    "investigation board",
    "collaboration",
    "case management",
    "clue tracker",
    "detective software",
    "crime solving",
    "team investigation"
  ],
  authors: [
    { name: "Samuel Baran", url: "https://samuelbaran.com" }
  ],
  creator: "Samuel Baran",
  applicationName: "Casefiles",
  openGraph: {
    title: "Casefiles",
    description:
      "Join Casefiles—your collaborative detective board for organizing clues, assigning leads, and cracking cases together.",
    url: "https://casefiles.app",
    siteName: "Casefiles",
    images: [
      {
        url: "https://your-domain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Casefiles – Collaborative Detective Board"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,

}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      dynamic
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConfigProvider
        variables={{ BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL! }}
      >
        <Providers>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <Navigation />
              {children}
             <Footer/> 
            </body>
          </html>
        </Providers>
      </ConfigProvider>
    </ClerkProvider>
  );
}
