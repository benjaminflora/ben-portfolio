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

export const metadata: Metadata = {
  title: "Ben Flora - Product Designer",
  description:
    "Product-oriented design systems designer building systems to enhance product UX.",
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
