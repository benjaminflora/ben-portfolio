"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/atlas";
import { NAME_MAX, normaliseRecording } from "@/lib/guestbook";
import { drawingToSend, useSketchbook } from "./sketchbookState";
import styles from "./SendToBen.module.css";

/* "Send to Ben": a visitor sends the blank page they drew on, with their
 * name. Ben reviews it by email; approved drawings join the sketchbook's
 * guest pages and replay with the visitor's name cursor. */

type Status = "idle" | "open" | "sending" | "sent" | "error";

export function SendToBen() {
  // Re-render whenever strokes change, so the button tracks the page.
  useSketchbook();
  const page = drawingToSend();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [sentPage, setSentPage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();

  useEffect(() => {
    if (status === "open") inputRef.current?.focus({ preventScroll: true });
  }, [status]);

  // New marks after sending can be sent again.
  const pageKey = page ? `${page.pageId}:${page.strokes.length}` : null;
  const alreadySent = sentPage !== null && sentPage === pageKey;

  if (!page && status !== "sent") return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!page) return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/sketchbook/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          website: form.get("website") ?? "",
          strokes: normaliseRecording(page.strokes),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't send right now.");
      setSentPage(pageKey);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send right now.");
      setStatus("error");
    }
  };

  if (status === "sent" && (alreadySent || !page)) {
    return (
      <p className={styles.sent} role="status">
        Sent! Ben will take a look.
      </p>
    );
  }

  if (status === "idle" || status === "sent") {
    return (
      <Button variant="secondary" onClick={() => setStatus("open")}>
        Send this page to Ben
      </Button>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label} htmlFor={nameId}>
        Your name
      </label>
      <div className={styles.row}>
        <input
          ref={inputRef}
          id={nameId}
          className={styles.input}
          value={name}
          maxLength={NAME_MAX}
          required
          autoComplete="given-name"
          placeholder="Shown on your cursor"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            // Keep the reader's arrow keys and Escape out of the field.
            event.stopPropagation();
            if (event.key === "Escape") setStatus("idle");
          }}
        />
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className={styles.honeypot}
          aria-hidden="true"
        />
        <Button type="submit" disabled={status === "sending" || !name.trim()}>
          {status === "sending" ? "Sending…" : "Send"}
        </Button>
        <Button variant="ghost" onClick={() => setStatus("idle")}>
          Cancel
        </Button>
      </div>
      {status === "error" ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.hint}>Ben reviews drawings before they go in the sketchbook.</p>
      )}
    </form>
  );
}
