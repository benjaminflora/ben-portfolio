"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/atlas";
import { closeBooklet, useBookletOpen } from "@/components/Booklet";
import { FadeInBlock } from "@/components/FadeIn";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/ChevronHorizontalIcon";
import { EmailIcon, LinkedInIcon, XIcon } from "@/components/icons/ContactIcons";
import { EMAIL_HREF, LINKEDIN_HREF, X_HREF } from "@/data/contact";
import {
  getProjectBySlug,
  projectCategories,
  type ProjectCategory,
} from "@/data/projects";
import { getWritingPiece } from "@/data/writing";
import styles from "./NavBar.module.css";
import { SectionNav } from "./SectionNav";
import { useRouteHistory } from "./useRouteHistory";

/** Design projects live on the home page, so that tab is "Home". */
function tabHref(key: ProjectCategory) {
  return key === "design" ? "/" : `/${key}`;
}

function tabLabel(key: ProjectCategory, label: string) {
  return key === "design" ? "Home" : label;
}

export function NavBar() {
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  // Writing pieces live under About.
  const writingPiece = pathname.startsWith("/writing/")
    ? getWritingPiece(pathname.slice("/writing/".length).split("/")[0])
    : undefined;
  const projectSlug = pathname.startsWith("/projects/")
    ? pathname.slice("/projects/".length).split("/")[0]
    : null;
  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined;
  const tabCategory = projectCategories.find((category) => pathname === tabHref(category.key));
  const pageLabel = isAbout
    ? "About"
    : (writingPiece?.title ??
      project?.title ??
      (tabCategory ? tabLabel(tabCategory.key, tabCategory.label) : "Home"));
  const bookletOpen = useBookletOpen();
  const router = useRouter();
  const history = useRouteHistory();

  const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Inside the journal, "home" means back out to the page.
    if (bookletOpen) {
      event.preventDefault();
      closeBooklet();
    }
  };

  // Tabs navigate on click (so an open sketchbook can close first), which
  // skips Link's prefetch — warm the tab pages up front instead.
  useEffect(() => {
    projectCategories
      .filter((category) => !category.disabled && !category.hidden)
      .forEach((category) => router.prefetch(tabHref(category.key)));
    router.prefetch("/about");
  }, [router]);


  return (
    <header className={styles.navBar}>
      <FadeInBlock className={styles.breadcrumbFade} delay="0.55s">
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.homeLink} aria-label="Home" onClick={goHome}>
            {/* BF logo (also the favicon, src/app/icon.svg). */}
            <img src="/brand/bf-logo.svg" alt="" className={styles.brandLogo} />
          </Link>
          <div className={styles.history}>
            <Button
              variant="ghost"
              iconOnly
              aria-label="Back"
              disabled={!history.canBack}
              onClick={history.back}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label="Forward"
              disabled={!history.canForward}
              onClick={history.forward}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <Link href="/" className={styles.domainLink} onClick={goHome}>
            <span className={`${styles.breadcrumbText} ${styles.breadcrumbDomain}`}>
              benjaminflora.com
            </span>
          </Link>
          <span
            className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbSep}`}
          >
            /
          </span>
          {bookletOpen ? (
            <>
              <button
                type="button"
                className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbBack}`}
                onClick={closeBooklet}
              >
                {pageLabel}
              </button>
              <span
                className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbSep}`}
              >
                /
              </span>
              <span
                className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbCurrent}`}
                aria-current="page"
              >
                sketchbook
              </span>
            </>
          ) : (
            <span
              className={`${styles.breadcrumbText} ${styles.breadcrumbPath} ${styles.breadcrumbCurrent}`}
            >
              {pageLabel}
            </span>
          )}
        </div>
      </FadeInBlock>

      <FadeInBlock className={styles.tabsFade} delay="0.58s">
        {/* The current page's button shows filled (not while the sketchbook
            is covering home). */}
        <SectionNav
          items={[
            ...projectCategories
              .filter((category) => !category.hidden)
              .map((category) => ({
                key: category.key as string,
                label: tabLabel(category.key, category.label),
                href: tabHref(category.key),
                current: category.key === tabCategory?.key,
                disabled: category.disabled,
              })),
            { key: "about", label: "About", href: "/about", current: isAbout || Boolean(writingPiece), disabled: false },
          ].map((section) => {
            const current = section.current && !bookletOpen;
            return {
              ...section,
              current,
              onSelect: () => {
                if (current) return;
                // The book lives on home: "Home" closes it with its outro;
                // any other page switches straight away (the reader tears
                // itself down instantly as home unmounts).
                if (bookletOpen && section.href === "/") {
                  closeBooklet();
                  return;
                }
                router.push(section.href);
              },
            };
          })}
        />
      </FadeInBlock>

      <FadeInBlock className={styles.actionsFade} delay="0.6s">
        <div className={styles.actions}>
          <Button variant="ghost" iconOnly href={EMAIL_HREF} aria-label="Email">
            <EmailIcon />
          </Button>
          <Button variant="ghost" iconOnly href={X_HREF} external aria-label="X">
            <XIcon />
          </Button>
          <Button variant="ghost" iconOnly href={LINKEDIN_HREF} external aria-label="LinkedIn">
            <LinkedInIcon />
          </Button>
        </div>
      </FadeInBlock>
    </header>
  );
}
