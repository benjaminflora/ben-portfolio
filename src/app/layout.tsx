import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { FadeInProvider } from "@/components/FadeIn";
import { NavBar } from "@/components/NavBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import "@/styles/globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Benjamin Flora — Design Systems Designer",
  description:
    "Product-oriented design systems designer building systems to enhance product UX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className={styles.body}>
        <SmoothScroll />
        <FadeInProvider>
          <div className={styles.shell}>
            <NavBar />
            {children}
          </div>
        </FadeInProvider>
      </body>
    </html>
  );
}
