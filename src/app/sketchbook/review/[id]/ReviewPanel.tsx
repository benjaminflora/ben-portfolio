"use client";

import { useState } from "react";
import { Button } from "@/components/atlas";
import { GuestReplay } from "@/components/Booklet/GuestReplay";
import type { GuestDrawing } from "@/lib/guestbook";
import styles from "./review.module.css";

type Status = "pending" | "approved" | "rejected" | "gone";

export function ReviewPanel({
  id,
  token,
  drawing,
  initialStatus,
}: {
  id: string;
  token: string;
  drawing: GuestDrawing | null;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Bumped to replay from the start.
  const [take, setTake] = useState(0);

  const decide = async (action: "approve" | "reject") => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/sketchbook/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token, action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.meta}>Sketchbook · drawing request</p>
        <h1 className={styles.title}>
          {drawing ? `From ${drawing.name}` : "This drawing is gone"}
        </h1>
        {drawing ? (
          <p className={styles.meta}>
            Sent {new Date(drawing.createdAt).toLocaleString()} · {drawing.strokes.length} strokes
          </p>
        ) : null}
      </header>

      {drawing ? (
        <div className={styles.sheet}>
          <GuestReplay key={take} drawing={drawing} playing />
        </div>
      ) : null}

      <div className={styles.actions}>
        {drawing ? (
          <Button variant="ghost" onClick={() => setTake((n) => n + 1)}>
            Replay
          </Button>
        ) : null}
        {status === "pending" ? (
          <>
            <Button variant="secondary" disabled={busy} onClick={() => decide("reject")}>
              Reject
            </Button>
            <Button disabled={busy} onClick={() => decide("approve")}>
              Approve
            </Button>
          </>
        ) : (
          <p className={styles.status} role="status">
            {status === "approved"
              ? "Approved — it's in the sketchbook (shows up within a minute)."
              : status === "rejected"
                ? "Rejected and deleted."
                : "Already handled, or the link has expired."}
          </p>
        )}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </main>
  );
}
