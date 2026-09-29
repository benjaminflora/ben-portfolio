"use client";

import { useState } from "react";
import { ContextualMenu, type ContextualMenuEntry } from "@/components/atlas";
import { GlobeIcon } from "@/components/icons/GlobeIcon";
import styles from "./AtlasShowcase.module.css";

const THEMES = ["Light", "Dark", "System"] as const;

export function AtlasShowcase() {
  const [lastAction, setLastAction] = useState<string>();
  const [theme, setTheme] = useState<(typeof THEMES)[number]>("System");
  const icon = <GlobeIcon />;
  const run = (label: string) => () => setLastAction(label);

  const items: ContextualMenuEntry[] = [
    { type: "section", label: "Actions" },
    { label: "Send to Agent", icon, hotkey: "a", onSelect: run("Send to Agent") },
    { label: "Duplicate", icon, hotkey: "d", onSelect: run("Duplicate") },
    { label: "Share", icon, onSelect: run("Share") },
    { type: "section", label: "View" },
    {
      type: "submenu",
      label: "Theme",
      icon,
      value: theme,
      items: THEMES.map((option) => ({
        label: option,
        checked: option === theme,
        onSelect: () => {
          setTheme(option);
          setLastAction(`Theme: ${option}`);
        },
      })),
    },
    {
      label: "Export",
      icon,
      disabled: true,
      disabledReason: "Export is not available yet",
    },
    { type: "section", label: "Danger zone" },
    { label: "Delete", icon, destructive: true, onSelect: run("Delete") },
  ];

  return (
    <article className={styles.card}>
      <ContextualMenu items={items}>
        <div className={styles.demo}>
          <p className={styles.hint}>
            {lastAction ? `Selected: ${lastAction}` : "Click anywhere to open"}
          </p>
        </div>
      </ContextualMenu>
      <div className={styles.info}>
        <p className={styles.title}>Contextual Menu</p>
        <p className={styles.source}>Nebula</p>
      </div>
    </article>
  );
}
