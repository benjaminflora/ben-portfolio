"use client";

import Link from "next/link";
import { GlobeIcon } from "@/components/icons/GlobeIcon";
import { scrollToTop } from "@/components/SmoothScroll";
import {
  EMAIL_HREF,
  LINKEDIN_HREF,
  RESUME_FILENAME,
  RESUME_HREF,
} from "@/data/contact";
import styles from "./Footer.module.css";

/* Figma node 290:367 — Footer */
const NAV_LINKS = [{ label: "Home", href: "/" }];

const CONNECT_LINKS = [
  { label: "Email", href: EMAIL_HREF, external: false },
  { label: "LinkedIn", href: LINKEDIN_HREF, external: true },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link href="/" className={styles.homeLink}>
            <GlobeIcon className={styles.brandIcon} />
            <span className={styles.brandText}>benjaminflora.com</span>
          </Link>
          <p className={styles.tagline}>
            Product-oriented design systems designer.
          </p>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div className={styles.column}>
            <p className={styles.columnLabel}>Navigate</p>
            <ul className={styles.list}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <p className={styles.columnLabel}>Connect</p>
            <ul className={styles.list}>
              {CONNECT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.link}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                    {link.external ? (
                      <span className={styles.arrow} aria-hidden="true">
                        ↗
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={RESUME_HREF}
                  download={RESUME_FILENAME}
                  className={styles.link}
                >
                  Resume
                  <span className={styles.arrow} aria-hidden="true">
                    ↓
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.meta}>© {year} Benjamin Flora</p>
        <button type="button" className={styles.backToTop} onClick={scrollToTop}>
          Back to top
          <span className={styles.arrow} aria-hidden="true">
            ↑
          </span>
        </button>
      </div>
    </footer>
  );
}
