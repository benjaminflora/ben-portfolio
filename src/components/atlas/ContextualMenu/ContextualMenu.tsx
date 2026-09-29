"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "../Tooltip";
import styles from "./ContextualMenu.module.css";

/* Figma: Nebula Design System, node 10090:16768 — Contextual Menu */

// Menu opens 4px below (or above) the interaction site.
const CURSOR_OFFSET = 4;
// Gap between a parent item and its sub-menu.
const SUBMENU_GAP = 4;
// Keeps a sub-menu's first item level with its parent (padding + border).
const SUBMENU_ALIGN = 5;
const VIEWPORT_MARGIN = 8;

export interface ContextualMenuAction {
  type?: "action";
  label: string;
  icon?: React.ReactNode;
  /** Letter pressed together with Option (⌥) while the menu is open. */
  hotkey?: string;
  destructive?: boolean;
  /** Marks the current value inside a selector sub-menu. */
  checked?: boolean;
  disabled?: boolean;
  /** Shown in a tooltip when hovering a disabled item. */
  disabledReason?: string;
  onSelect?: () => void;
}

export interface ContextualMenuSubmenu {
  type: "submenu";
  label: string;
  icon?: React.ReactNode;
  /** Current value, shown as secondary text (selector parent). */
  value?: string;
  disabled?: boolean;
  disabledReason?: string;
  items: ContextualMenuEntry[];
}

/** Starts a group. After the first group, a divider is drawn above it. */
export interface ContextualMenuSection {
  type: "section";
  label?: string;
}

export type ContextualMenuEntry =
  | ContextualMenuAction
  | ContextualMenuSubmenu
  | ContextualMenuSection;

type Anchor =
  | { kind: "point"; x: number; y: number }
  | { kind: "item"; rect: DOMRect };

interface ContextualMenuProps {
  items: ContextualMenuEntry[];
  children: React.ReactNode;
  /** Pointer interaction that opens the menu. */
  trigger?: "click" | "contextmenu";
  className?: string;
}

export function ContextualMenu({
  items,
  children,
  trigger = "click",
  className,
}: ContextualMenuProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const close = useCallback(() => setAnchor(null), []);

  const open = (event: React.MouseEvent) => {
    // Events from the portaled menu still bubble through the React tree.
    if ((event.target as Element).closest("[data-contextual-menu]")) return;
    event.preventDefault();
    setAnchor({ kind: "point", x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    if (!anchor) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-contextual-menu]")) {
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [anchor, close]);

  const classes = [styles.trigger, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      onClick={trigger === "click" ? open : undefined}
      onContextMenu={trigger === "contextmenu" ? open : undefined}
    >
      {children}
      {anchor
        ? createPortal(
            <MenuPanel
              entries={items}
              anchor={anchor}
              onDismiss={close}
              onBack={close}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

interface MenuPanelProps {
  entries: ContextualMenuEntry[];
  anchor: Anchor;
  /** Closes the whole menu tree. */
  onDismiss: () => void;
  /** Closes just this panel. */
  onBack: () => void;
}

function MenuPanel({ entries, anchor, onDismiss, onBack }: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [position, setPosition] = useState<{ left: number; top: number }>();
  const [openSub, setOpenSub] = useState<{ index: number; rect: DOMRect }>();

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const { width, height } = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left: number;
    let top: number;

    if (anchor.kind === "point") {
      // Left aligned by default; right aligned when it would overflow.
      left = anchor.x;
      if (left + width > vw - VIEWPORT_MARGIN) left = anchor.x - width;
      // Below the cursor by default; above it when it would overflow.
      top = anchor.y + CURSOR_OFFSET;
      if (top + height > vh - VIEWPORT_MARGIN) {
        top = anchor.y - CURSOR_OFFSET - height;
      }
    } else {
      // Sub-menus open to the right, or to the left when there's no room.
      left = anchor.rect.right + SUBMENU_GAP;
      if (left + width > vw - VIEWPORT_MARGIN) {
        left = anchor.rect.left - SUBMENU_GAP - width;
      }
      top = anchor.rect.top - SUBMENU_ALIGN;
      if (top + height > vh - VIEWPORT_MARGIN) {
        top = vh - VIEWPORT_MARGIN - height;
      }
    }

    setPosition({
      left: Math.max(VIEWPORT_MARGIN, left),
      top: Math.max(VIEWPORT_MARGIN, top),
    });
  }, [anchor]);

  useEffect(() => {
    if (position) panelRef.current?.focus({ preventScroll: true });
  }, [position]);

  const focusable = () =>
    itemRefs.current.filter(
      (item): item is HTMLButtonElement =>
        !!item && item.getAttribute("aria-disabled") !== "true",
    );

  const moveFocus = (step: 1 | -1) => {
    const items = focusable();
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      current === -1
        ? step === 1
          ? 0
          : items.length - 1
        : (current + step + items.length) % items.length;
    items[next].focus({ preventScroll: true });
  };

  const openSubmenu = (index: number) => {
    const item = itemRefs.current[index];
    if (item) setOpenSub({ index, rect: item.getBoundingClientRect() });
  };

  const closeSubmenu = () => {
    if (!openSub) return;
    itemRefs.current[openSub.index]?.focus({ preventScroll: true });
    setOpenSub(undefined);
  };

  const select = (entry: ContextualMenuAction) => {
    onDismiss();
    entry.onSelect?.();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.altKey) {
      // event.code, since Option changes event.key on macOS.
      const entry = entries.find(
        (e): e is ContextualMenuAction =>
          (e.type ?? "action") === "action" &&
          !(e as ContextualMenuAction).disabled &&
          event.code ===
            `Key${(e as ContextualMenuAction).hotkey?.toUpperCase()}`,
      );
      if (entry) {
        event.preventDefault();
        select(entry);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowRight": {
        const index = itemRefs.current.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (
          index !== -1 &&
          entries[index].type === "submenu" &&
          !(entries[index] as ContextualMenuSubmenu).disabled
        ) {
          event.preventDefault();
          openSubmenu(index);
        }
        break;
      }
      case "ArrowLeft":
        if (anchor.kind === "item") {
          event.preventDefault();
          onBack();
        }
        break;
      case "Escape":
        event.preventDefault();
        onBack();
        break;
      case "Tab":
        event.preventDefault();
        onDismiss();
        break;
    }
  };

  return (
    <>
      <div
        ref={panelRef}
        className={styles.menu}
        role="menu"
        tabIndex={-1}
        data-contextual-menu=""
        style={
          position
            ? { left: position.left, top: position.top }
            : { left: 0, top: 0, visibility: "hidden" }
        }
        onKeyDown={onKeyDown}
      >
        {entries.map((entry, index) => {
          if (entry.type === "section") {
            const first = index === 0;
            return (
              <div
                key={index}
                className={styles.section}
                role={entry.label ? "presentation" : "separator"}
              >
                {!first ? <div className={styles.divider} /> : null}
                {entry.label ? (
                  <span className={styles.header}>{entry.label}</span>
                ) : null}
              </div>
            );
          }

          const isSubmenu = entry.type === "submenu";
          const action = entry as ContextualMenuAction;
          const itemClasses = [
            styles.item,
            action.destructive ? styles.destructive : null,
            isSubmenu && openSub?.index === index ? styles.expanded : null,
          ]
            .filter(Boolean)
            .join(" ");

          const item = (
            <button
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              className={itemClasses}
              role={
                action.checked !== undefined ? "menuitemradio" : "menuitem"
              }
              aria-checked={
                action.checked !== undefined ? action.checked : undefined
              }
              aria-haspopup={isSubmenu ? "menu" : undefined}
              aria-expanded={isSubmenu ? openSub?.index === index : undefined}
              aria-disabled={entry.disabled || undefined}
              onPointerMove={(event) => {
                if (event.pointerType === "mouse") {
                  event.currentTarget.focus({ preventScroll: true });
                }
              }}
              onPointerEnter={() => {
                if (isSubmenu && !entry.disabled) openSubmenu(index);
                else setOpenSub(undefined);
              }}
              onClick={() => {
                if (entry.disabled) return;
                if (isSubmenu) openSubmenu(index);
                else select(action);
              }}
            >
              <span className={styles.leading}>
                {entry.icon ? (
                  <span className={styles.icon}>{entry.icon}</span>
                ) : null}
                <span className={styles.label}>{entry.label}</span>
              </span>
              {isSubmenu && entry.value ? (
                <span className={styles.value}>{entry.value}</span>
              ) : null}
              {action.hotkey ? <Hotkey letter={action.hotkey} /> : null}
              {action.checked ? <CheckIcon /> : null}
              {isSubmenu ? <ChevronIcon /> : null}
            </button>
          );

          return (
            <div key={index} className={styles.row} role="none">
              {entry.disabled && entry.disabledReason ? (
                <Tooltip label={entry.disabledReason} className={styles.tooltip}>
                  {item}
                </Tooltip>
              ) : (
                item
              )}
            </div>
          );
        })}
      </div>
      {openSub ? (
        <MenuPanel
          entries={(entries[openSub.index] as ContextualMenuSubmenu).items}
          anchor={{ kind: "item", rect: openSub.rect }}
          onDismiss={onDismiss}
          onBack={closeSubmenu}
        />
      ) : null}
    </>
  );
}

function Hotkey({ letter }: { letter: string }) {
  return (
    <span className={styles.hotkey} aria-label={`Option ${letter}`}>
      <span className={styles.key}>
        <img
          src="/icons/contextual-menu/option.svg"
          alt=""
          width={12}
          height={12}
        />
      </span>
      <span className={styles.key}>
        <span className={styles.keyLetter}>{letter}</span>
      </span>
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg
      className={styles.trailing}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 2.5 8 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className={styles.trailing}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m2.5 6.25 2.25 2.25 4.75-5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </svg>
  );
}
