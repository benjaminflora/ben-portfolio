import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons/ArrowUpRightIcon";
import styles from "./ProjectCard.module.css";

/* Figma node 321:446 — Project Card / Nebula Design System */
interface ProjectCardProps {
  title: string;
  description?: string;
  meta?: string;
  /** Shown on the right of the title row, e.g. "Design Intern". */
  role?: string;
  href?: string;
  /** When true, `href` opens in a new tab. */
  external?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  disabled?: boolean;
  showMeta?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  meta,
  role,
  href,
  external = false,
  imageSrc,
  imageAlt = "",
  disabled = false,
  showMeta = true,
  onSelect,
  className,
}: ProjectCardProps) {
  const classes = [styles.card, disabled && styles.disabled, className]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div className={styles.thumbnail}>
        {imageSrc ? (
          // Served resized and as WebP/AVIF by Next's image optimizer: the
          // originals are 2400px-wide PNG/JPGs (up to ~1.8MB each).
          <Image
            src={imageSrc}
            alt={showMeta ? imageAlt : ""}
            className={styles.thumbnailImage}
            fill
            sizes="(max-width: 720px) 100vw, min(50vw, 800px)"
          />
        ) : null}
        {external && href ? (
          // Leaves the site: mark it rather than the "to be released" veil.
          <span className={styles.externalBadge} aria-hidden="true">
            <ArrowUpRightIcon className={styles.externalIcon} />
          </span>
        ) : disabled ? (
          <div className={styles.overlay}>
            <p className={styles.overlayLabel}>To be Released</p>
          </div>
        ) : null}
      </div>
      {showMeta ? (
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <p className={styles.title}>{title}</p>
            {role ? <p className={styles.role}>{role}</p> : null}
          </div>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
          {meta ? <p className={styles.meta}>{meta}</p> : null}
        </div>
      ) : null}
    </>
  );

  if (external && href) {
    return (
      <a
        href={href}
        className={`${styles.link} ${classes}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title}, opens in a new tab`}
      >
        {inner}
      </a>
    );
  }

  if (onSelect && !disabled) {
    return (
      <button
        type="button"
        className={`${styles.select} ${classes}`}
        onClick={onSelect}
        aria-label={imageAlt || `View ${title}`}
      >
        {inner}
      </button>
    );
  }

  if (!href || disabled) {
    return (
      <article className={classes} aria-disabled={disabled ? true : undefined}>
        {inner}
      </article>
    );
  }

  return (
    <Link href={href} className={`${styles.link} ${classes}`}>
      {inner}
    </Link>
  );
}
