import Link from "next/link";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  title: string;
  company?: string;
  role?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  disabled?: boolean;
  showMeta?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ProjectCard({
  title,
  company,
  role,
  href,
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
          <img
            src={imageSrc}
            alt={showMeta ? imageAlt : ""}
            className={styles.thumbnailImage}
          />
        ) : null}
        {disabled ? (
          <div className={styles.overlay}>
            <p className={styles.overlayLabel}>To be Released</p>
          </div>
        ) : null}
      </div>
      {showMeta ? (
        <div className={styles.info}>
          <div className={styles.meta}>
            <p className={styles.title}>{title}</p>
            {company ? <p className={styles.company}>{company}</p> : null}
          </div>
          {role ? <p className={styles.role}>{role}</p> : null}
        </div>
      ) : null}
    </>
  );

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
