"use client";

import { Tab, type TabState } from "../Tab";
import styles from "./TabGroup.module.css";

export interface TabItem {
  label: string;
  state?: TabState;
  href?: string;
}

interface TabGroupProps {
  tabs: TabItem[];
  onTabChange?: (index: number) => void;
  className?: string;
}

export function TabGroup({ tabs, onTabChange, className }: TabGroupProps) {
  const classes = [styles.tabGroup, className].filter(Boolean).join(" ");

  return (
    <nav className={classes} role="tablist">
      {tabs.map((tab, index) => (
        <Tab
          key={tab.label}
          label={tab.label}
          state={tab.state}
          href={tab.href}
          onClick={() => onTabChange?.(index)}
        />
      ))}
    </nav>
  );
}
