import Link from "next/link";
import { Tooltip } from "../Tooltip";
import styles from "./Tab.module.css";

export type TabState = "active" | "enabled" | "disabled";

interface TabProps {
  label: string;
  state?: TabState;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function Tab({
  label,
  state = "enabled",
  href,
  onClick,
  className,
}: TabProps) {
  const classes = [styles.tab, styles[state], className]
    .filter(Boolean)
    .join(" ");

  const labelEl = <span className={styles.label}>{label}</span>;

  if (state === "disabled") {
    return (
      <Tooltip label="Coming soon">
        <span className={styles.disabledFace}>
          <button
            type="button"
            className={classes}
            disabled
            aria-disabled="true"
          >
            {labelEl}
          </button>
        </span>
      </Tooltip>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-current={state === "active" ? "page" : undefined}
      >
        {labelEl}
      </Link>
    );
  }

  if (state === "active") {
    return (
      <div className={classes} aria-current="page">
        {labelEl}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
    >
      {labelEl}
    </button>
  );
}
