import { INK_COLORS, LINE_SIZES, PEN_BY_ID, PENS, PenModel } from "./pens";
import { redo, undo, updateSketchbook, useSketchbook } from "./sketchbookState";
import styles from "./Studio.module.css";

/* Ben's pens (and an eraser) standing tip-up along the bottom edge. The one in
 * hand rises above the rest; pick it again to put it down. */
export function PenTray({ onPick }: { onPick: () => void }) {
  const { pen: inHand, engine, canUndo, canRedo, color, size } = useSketchbook();
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
        {held ? (
          // Pen in hand: its colour (not for the eraser) and line weight.
          <div className={styles.tools} title={`${held.name} · ${held.detail}`}>
            {held.kind !== "eraser" ? (
              <div className={styles.swatches} role="radiogroup" aria-label="Ink colour">
                <button
                  type="button"
                  role="radio"
                  aria-checked={color === null}
                  aria-label={`${held.name}'s own colour`}
                  className={styles.swatch}
                  data-own=""
                  style={{ ["--swatch" as string]: held.ink }}
                  onClick={() => updateSketchbook({ color: null })}
                />
                {INK_COLORS.map((ink) => (
                  <button
                    key={ink.id}
                    type="button"
                    role="radio"
                    aria-checked={color === ink.hex}
                    aria-label={ink.name}
                    className={styles.swatch}
                    style={{ ["--swatch" as string]: ink.hex }}
                    onClick={() => updateSketchbook({ color: ink.hex })}
                  />
                ))}
              </div>
            ) : null}
            <div className={styles.sizes} role="radiogroup" aria-label="Line size">
              {LINE_SIZES.map((line, i) => (
                <button
                  key={line.id}
                  type="button"
                  role="radio"
                  aria-checked={size === line.id}
                  aria-label={line.name}
                  className={styles.sizeButton}
                  onClick={() => updateSketchbook({ size: line.id })}
                >
                  <span
                    className={styles.sizeDot}
                    style={{
                      ["--dot" as string]: `${4 + i * 3}px`,
                      background:
                        held.kind === "eraser" ? undefined : (color ?? held.ink),
                    }}
                    data-eraser={held.kind === "eraser" ? "" : undefined}
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className={styles.trayCaption} aria-live="polite">
            Pick a pen
          </p>
        )}
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
