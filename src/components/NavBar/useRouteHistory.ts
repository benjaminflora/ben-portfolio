"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "bf-route-history";

type Trail = { entries: string[]; index: number };

function loadTrail(pathname: string): Trail {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [pathname], index: 0 };
    const trail = JSON.parse(raw) as Trail;
    if (
      trail &&
      Array.isArray(trail.entries) &&
      trail.entries.length > 0 &&
      trail.entries.every((entry) => typeof entry === "string") &&
      Number.isInteger(trail.index) &&
      trail.index >= 0 &&
      trail.index < trail.entries.length &&
      trail.entries[trail.index] === pathname
    ) {
      return trail;
    }
  } catch {
    /* Private mode, or a trail left behind by an older page. */
  }
  return { entries: [pathname], index: 0 };
}

/**
 * In-app back/forward. The browser won't say whether the next history entry
 * stays on this site, so the trail is tracked here and a direction is disabled
 * when it wouldn't open another page.
 */
export function useRouteHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const [trail, setTrail] = useState<Trail>({ entries: [pathname], index: 0 });
  const [ready, setReady] = useState(false);
  const trailRef = useRef(trail);
  trailRef.current = trail;

  useEffect(() => {
    const next = loadTrail(pathname);
    trailRef.current = next;
    setTrail(next);
    setReady(true);
    // The stored trail is only valid for the page that was open on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    setTrail((current) => {
      if (current.entries[current.index] === pathname) return current;
      let next: Trail;
      if (current.entries[current.index - 1] === pathname) {
        next = { entries: current.entries, index: current.index - 1 };
      } else if (current.entries[current.index + 1] === pathname) {
        next = { entries: current.entries, index: current.index + 1 };
      } else {
        const entries = [...current.entries.slice(0, current.index + 1), pathname];
        next = { entries, index: entries.length - 1 };
      }
      trailRef.current = next;
      return next;
    });
  }, [pathname, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
    } catch {
      /* Ignore quota or private-mode failures. */
    }
  }, [trail, ready]);

  const step = (direction: -1 | 1) => {
    const current = trailRef.current;
    const index = current.index + direction;
    if (index < 0 || index >= current.entries.length) return;
    const next = { entries: current.entries, index };
    trailRef.current = next;
    setTrail(next);
    if (direction < 0) router.back();
    else router.forward();
  };

  return {
    canBack: trail.index > 0,
    canForward: trail.index < trail.entries.length - 1,
    back: () => step(-1),
    forward: () => step(1),
  };
}
