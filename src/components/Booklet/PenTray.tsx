import { PEN_BY_ID, PENS, PenModel } from "./pens";
import { redo, undo, updateSketchbook, useSketchbook } from "./sketchbookState";
import styles from "./Studio.module.css";

/* Ben's pens (and an eraser) standing tip-up along the bottom edge. The one in
 * hand rises above the rest; pick it again to put it down. */
export function PenTray({ onPick }: { onPick: () => void }) {
  const { pen: inHand, engine, canUndo, canRedo } = useSketchbook();
  const held = inHand ? PEN_BY_ID[inHand] : null;

  return (
    <div className={styles.tray}>
      <div className={styles.trayBar}>
        <button
          type="button"
          className={styles.historyButton}
          disabled={!canUndo}
          onClick={undo}
        >
          ↶ Undo
        </button>
        <p className={styles.trayCaption} aria-live="polite">
          {held ? `${held.name} · ${held.detail}` : "Pick a pen"}
        </p>
        <button
          type="button"
          className={styles.historyButton}
          disabled={!canRedo}
          onClick={redo}
        >
          Redo ↷
        </button>
      </div>
      <div className={styles.penRow} role="radiogroup" aria-label="Pick a pen to draw with">
        {PENS.map((pen, i) => {
          const isHeld = inHand === pen.id;
          return (
            <button
              key={pen.id}
              type="button"
              role="radio"
              aria-checked={isHeld}
              aria-label={`${pen.name}, ${pen.detail}`}
              className={styles.penSlot}
              data-held={isHeld ? "" : undefined}
              style={{ ["--i" as string]: i }}
              onClick={() => {
                updateSketchbook({ pen: isHeld ? null : pen.id });
                if (!isHeld) onPick();
              }}
            >
              <PenModel pen={pen.id} engine={engine} upright className={styles.penModel} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
