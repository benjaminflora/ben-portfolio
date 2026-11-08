import Link from "next/link";
import styles from "./IndexList.module.css";

/* Figma node 211:1186 — Index: numbered rows of title + source. */

export interface IndexListItem {
  id: string;
  title: string;
  /** Right-aligned context, e.g. the publication or team. */
  source: string;
  /** Rows without a link still take part in the hover focus. */
  href?: string;
  /** Opens in a new tab. */
  external?: boolean;
}

interface IndexListProps {
  items: IndexListItem[];
  className?: string;
}

export function IndexList({ items, className }: IndexListProps) {
  return (
    <ol className={[styles.list, className].filter(Boolean).join(" ")}>
      {items.map((item, index) => {
        const content = (
          <>
            <span className={styles.lead}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.title}>{item.title}</span>
            </span>
            <span className={styles.source}>{item.source}</span>
          </>
        );

        return (
          <li key={item.id}>
            {!item.href ? (
              <div className={styles.row}>{content}</div>
            ) : item.external ? (
              <a
                className={styles.row}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            ) : (
              <Link className={styles.row} href={item.href}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
