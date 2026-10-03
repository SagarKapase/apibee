import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Wordmark font for the logo.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves relative canonical and Open Graph URLs against the production domain.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "testingapis.com: a fake REST API for prototyping and testing",
    template: "%s | testingapis.com",
  },
  description:
    "A free fake REST API with realistic JSON and XML data. No API key or account required.",
  openGraph: {
    title: "testingapis.com: a fake REST API for prototyping and testing",
    description:
      "A free fake REST API with realistic JSON and XML data. No API key or account required.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
  },
  // Lets AdSense verify that this site belongs to the account.
  ...(ADSENSE_CLIENT ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        {/* A plain async script, so the tag is in the HTML that AdSense checks. React moves it into <head>. */}
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
