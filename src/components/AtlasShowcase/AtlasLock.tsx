"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AtlasLock.module.css";

// Soft lock: this ships to the browser, so it keeps casual visitors out
// rather than securing anything.
const ACCESS_CODE = "0820";
const STORAGE_KEY = "atlas-unlocked";

function readUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveUnlocked() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage unavailable; stays unlocked until reload.
  }
}

export function AtlasLock({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState<string[]>(() =>
    Array(ACCESS_CODE.length).fill(""),
  );
  const [error, setError] = useState(false);
  // Re-keys the code row so the shake replays on every wrong attempt.
  const [attempt, setAttempt] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setUnlocked(readUnlocked());
  }, []);

  useEffect(() => {
    if (attempt > 0) inputs.current[0]?.focus();
  }, [attempt]);

  if (unlocked) return <>{children}</>;

  const focus = (index: number) => {
    const input = inputs.current[index];
    input?.focus();
    input?.select();
  };

  const submit = (code: string[]) => {
    if (code.join("") === ACCESS_CODE) {
      saveUnlocked();
      setUnlocked(true);
      return;
    }
    setError(true);
    setAttempt((count) => count + 1);
    setDigits(Array(ACCESS_CODE.length).fill(""));
  };

  // Writes typed or pasted digits starting at `index`.
  const fill = (index: number, value: string) => {
    const incoming = value.replace(/\D/g, "").split("");
    if (incoming.length === 0) return;
    const next = [...digits];
    incoming
      .slice(0, ACCESS_CODE.length - index)
      .forEach((digit, offset) => (next[index + offset] = digit));
    setDigits(next);
    setError(false);

    const filled = Math.min(index + incoming.length, ACCESS_CODE.length);
    if (next.every(Boolean)) submit(next);
    else focus(filled);
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      focus(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight" && index < ACCESS_CODE.length - 1) {
      event.preventDefault();
      focus(index + 1);
    }
  };

  return (
    <div className={styles.lock}>
      <div className={styles.content}>
        <div className={styles.heading}>
          <LockIcon />
          <p className={styles.title}>Atlas is locked</p>
          <p className={styles.subtitle}>Enter the 4-digit access code.</p>
        </div>
        <div
          key={attempt}
          className={`${styles.code} ${error ? styles.error : ""}`}
          role="group"
          aria-label="Access code"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              className={styles.digit}
              type="password"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={ACCESS_CODE.length}
              aria-label={`Digit ${index + 1}`}
              aria-invalid={error || undefined}
              value={digit}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (value === "") {
                  const next = [...digits];
                  next[index] = "";
                  setDigits(next);
                } else {
                  fill(index, value.replace(digit, "") || value);
                }
              }}
              onPaste={(event) => {
                event.preventDefault();
                fill(index, event.clipboardData.getData("text"));
              }}
              onKeyDown={(event) => onKeyDown(index, event)}
            />
          ))}
        </div>
        <p className={styles.message} role="status" aria-live="polite">
          {error ? "Incorrect code. Try again." : " "}
        </p>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" />
    </svg>
  );
}
