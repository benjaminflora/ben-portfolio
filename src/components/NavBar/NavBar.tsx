"use client";

import { usePathname } from "next/navigation";
import { Button, TabGroup } from "@/components/atlas";
import { FadeInBlock } from "@/components/FadeIn";
import { GlobeIcon } from "@/components/icons/GlobeIcon";
import { getProjectBySlug } from "@/data/projects";
import styles from "./NavBar.module.css";

export function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const projectSlug = pathname.startsWith("/projects/")
    ? pathname.slice("/projects/".length).split("/")[0]
    : null;
  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined;
  const pageLabel = isAbout ? "About" : project?.title ?? "Home";

  const mainNavTabs = [
    {
      label: "Home",
      href: "/",
      state: isHome ? ("active" as const) : ("enabled" as const),
    },
    {
      label: "About",
      href: "/about",
      state: isAbout ? ("active" as const) : ("enabled" as const),
    },
  ];

  return (
    <header className={styles.navBar}>
      <FadeInBlock className={styles.breadcrumbFade} delay="1s">
        <div className={styles.breadcrumb}>
          <GlobeIcon className={styles.breadcrumbIcon} />
          <span
            className={`${styles.breadcrumbText} ${styles.breadcrumbDomain}`}
          >
            benjaminFlora.com
          </span>
          <span className={`${styles.breadcrumbText} ${styles.breadcrumbPath}`}>
            /
          </span>
          <span
            className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbCurrent}`}
          >
            {pageLabel}
          </span>
        </div>
      </FadeInBlock>

      <FadeInBlock className={styles.navTabsFade} delay="1.1s">
        <TabGroup tabs={mainNavTabs} className={styles.navTabs} />
      </FadeInBlock>

      <FadeInBlock className={styles.actionsFade} delay="1.2s">
        <div className={styles.actions}>
          <Button
            variant="secondary"
            href="/resume.pdf"
            download="BenjaminFlora_ResumeF26.pdf"
          >
            Download Resume
          </Button>
        </div>
      </FadeInBlock>
    </header>
  );
}
