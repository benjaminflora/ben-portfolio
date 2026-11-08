"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Button, type ButtonVariant } from "../Button";
import { ContextualMenu, type ContextualMenuEntry } from "../ContextualMenu";
import styles from "./SplitButton.module.css";

/* Figma node 310:1359 — Split Button: primary action + menu trigger. */

interface SplitButtonProps {
  label: React.ReactNode;
  /** Primary action as a link… */
  href?: string;
  external?: boolean;
  /** …or as a handler. */
  onClick?: () => void;
  /** Entries shown by the chevron. */
  items: ContextualMenuEntry[];
  menuLabel?: string;
  variant?: ButtonVariant;
  className?: string;
}

export function SplitButton({
  label,
  href,
  external,
  onClick,
  items,
  menuLabel = "More options",
  variant = "primary",
  className,
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={[styles.splitButton, className].filter(Boolean).join(" ")}>
      {href !== undefined ? (
        <Button variant={variant} shape="start" href={href} external={external}>
          {label}
        </Button>
      ) : (
        <Button variant={variant} shape="start" onClick={onClick}>
          {label}
        </Button>
      )}
      <ContextualMenu items={items} placement="below" onOpenChange={setOpen}>
        <Button
          variant={variant}
          shape="end"
          iconOnly
          className={styles.trigger}
          aria-label={menuLabel}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <ChevronDownIcon />
        </Button>
      </ContextualMenu>
    </div>
  );
}
