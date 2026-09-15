"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/atlas";
import { FadeInBlock } from "@/components/FadeIn";
import { GlobeIcon } from "@/components/icons/GlobeIcon";
import { getProjectBySlug } from "@/data/projects";
import styles from "./NavBar.module.css";

export function NavBar() {
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const projectSlug = pathname.startsWith("/projects/")
    ? pathname.slice("/projects/".length).split("/")[0]
    : null;
  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined;
  const pageLabel = isAbout ? "About" : project?.title ?? "Home";

  return (
    <header className={styles.navBar}>
      <FadeInBlock className={styles.breadcrumbFade} delay="1s">
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.homeLink} aria-label="Home">
            <GlobeIcon className={styles.breadcrumbIcon} />
            <span
              className={`${styles.breadcrumbText} ${styles.breadcrumbDomain}`}
            >
              benjaminFlora.com
            </span>
          </Link>
          <span
            className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbSep}`}
          >
            /
          </span>
          <span
            className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbCurrent}`}
          >
            {pageLabel}
          </span>
        </div>
      </FadeInBlock>

      <FadeInBlock className={styles.actionsFade} delay="1.1s">
        <div className={styles.actions}>
          <Button
            variant="secondary"
            href="/resume.pdf"
            download="BenjaminFlora_ResumeF26.pdf"
          >
            <span className={styles.resumeFull}>Download Resume</span>
            <span className={styles.resumeShort}>Resume</span>
          </Button>
        </div>
      </FadeInBlock>
    </header>
  );
}
