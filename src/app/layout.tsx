import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { FadeInProvider } from "@/components/FadeIn";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import "@/styles/globals.css";
import styles from "./layout.module.css";

// Body and labels — Geist.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// Headers — Timeless Text (custom cut, single weight 479; Timeless Free
// Font License, see fonts/TimelessText-LICENSE.pdf).
const timeless = localFont({
  src: [{ path: "./fonts/TimelessText-W479.woff2", weight: "479", style: "normal" }],
  variable: "--font-timeless",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const SITE_TITLE = "Ben Flora - Product Designer";
const SITE_DESCRIPTION =
  "Product-oriented design systems designer building systems to enhance product UX.";

/* Link previews: a still of the hero (what most apps show) plus a short clip
 * of the sketchbook (played inline by the apps that support og:video, e.g.
 * iMessage). Both 1200 × 630, in public/og. */
const PREVIEW_IMAGE = {
  url: "/og/preview.jpg",
  width: 1200,
  height: 630,
  alt: "Ben Flora's portfolio: a sketchbook beside the headline “I’m Ben, a product-oriented design-engineer and autodidact.”",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://benjaminflora.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ben Flora",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [PREVIEW_IMAGE],
    videos: [
      {
        // Absolute: Next resolves image URLs against metadataBase, not videos.
        url: "https://benjaminflora.com/og/preview.mp4",
        secureUrl: "https://benjaminflora.com/og/preview.mp4",
        type: "video/mp4",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [PREVIEW_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${timeless.variable}`}>
      <body className={styles.body}>
        <SmoothScroll />
        <FadeInProvider>
          <div className={styles.shell}>
            <NavBar />
            <div className={styles.page} data-booklet-zoom-root>
              {children}
              <Footer />
            </div>
          </div>
        </FadeInProvider>
      </body>
    </html>
  );
}
