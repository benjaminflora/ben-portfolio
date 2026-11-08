import type { ProjectStatus } from "@/data/projects";
import styles from "./StatusIndicator.module.css";

const LABEL: Record<ProjectStatus, string> = { live: "Live", ongoing: "Ongoing" };

interface StatusIndicatorProps {
  status?: ProjectStatus;
  className?: string;
}

/* Figma node 376:2480 — project status, shown in case study headers.
 * Inactive projects pass no status and render nothing. */
export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  if (!status) return null;
  return (
    <span
      className={[styles.status, className].filter(Boolean).join(" ")}
      data-status={status}
    >
      <span className={styles.dot} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
