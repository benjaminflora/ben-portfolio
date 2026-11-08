import { useId } from "react";

/* Ben's stationery. Side-view models drawn tip-left in a 300 × 24 box
 * (roughly the 15:1 length-to-girth of the real pens); `upright` stands them
 * tip-up. */

export type PenId = "jm20" | "graphgear" | "kurutoga" | "eraser";

export interface Pen {
  id: PenId;
  name: string;
  detail: string;
  ink: string;
  /** Line width as a fraction of the page width. */
  width: number;
  alpha: number;
  /** Graphite breaks up a little; ink lays down flat and swells when slow;
   * the eraser lifts whatever is under it. */
  kind: "ink" | "graphite" | "eraser";
}

export const PENS: Pen[] = [
  {
    id: "jm20",
    name: "Pentel Pulaman JM20",
    detail: "Red ink",
    ink: "#c3172a",
    width: 0.0058,
    alpha: 0.94,
    kind: "ink",
  },
  {
    id: "graphgear",
    name: "Pentel GraphGear 1000",
    detail: "0.5 HB",
    ink: "#4b4d52",
    width: 0.0026,
    alpha: 0.72,
    kind: "graphite",
  },
  {
    id: "kurutoga",
    name: "uni Kuru Toga",
    detail: "0.7 HB",
    ink: "#3a3c41",
    width: 0.0034,
    alpha: 0.84,
    kind: "graphite",
  },
  {
    id: "eraser",
    name: "Eraser",
    detail: "Rubs out ink and graphite",
    ink: "#ffffff",
    width: 0.035,
    alpha: 1,
    kind: "eraser",
  },
];

export const PEN_BY_ID = Object.fromEntries(PENS.map((pen) => [pen.id, pen])) as Record<
  PenId,
  Pen
>;

interface PenModelProps {
  pen: PenId;
  /** Kuru Toga only: engine turns to show through the window. */
  engine?: number;
  upright?: boolean;
  className?: string;
}

export function PenModel({ pen, engine = 0, upright = false, className }: PenModelProps) {
  // Gradient ids must be unique per instance (tray + cursor render together).
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      className={className}
      viewBox={upright ? "0 0 24 300" : "0 0 300 24"}
      aria-hidden="true"
      focusable="false"
    >
      <g transform={upright ? "translate(24 0) rotate(90)" : undefined}>
      <defs>
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfbfb" />
          <stop offset="0.35" stopColor="#b9bbbe" />
          <stop offset="0.6" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#6c6f73" />
        </linearGradient>
        <linearGradient id={id("brushed")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e4e6" />
          <stop offset="0.45" stopColor="#9a9da1" />
          <stop offset="0.7" stopColor="#cfd1d4" />
          <stop offset="1" stopColor="#6d7074" />
        </linearGradient>
        <linearGradient id={id("black")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#55575b" />
          <stop offset="0.3" stopColor="#141516" />
          <stop offset="0.75" stopColor="#050505" />
          <stop offset="1" stopColor="#2b2c2e" />
        </linearGradient>
        <linearGradient id={id("gunmetal")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a8089" />
          <stop offset="0.4" stopColor="#3f444b" />
          <stop offset="0.75" stopColor="#24272c" />
          <stop offset="1" stopColor="#4a5058" />
        </linearGradient>
        <linearGradient id={id("nib")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0f2" />
          <stop offset="0.5" stopColor="#b8bdc3" />
          <stop offset="1" stopColor="#80868d" />
        </linearGradient>
        <linearGradient id={id("red")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef5a63" />
          <stop offset="0.4" stopColor="#c3172a" />
          <stop offset="1" stopColor="#6e0c16" />
        </linearGradient>
        <linearGradient id={id("rubber")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#ecebe7" />
          <stop offset="1" stopColor="#bdbcb7" />
        </linearGradient>
        <linearGradient id={id("sleeve")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d8fd8" />
          <stop offset="0.45" stopColor="#2a62b8" />
          <stop offset="1" stopColor="#173f7c" />
        </linearGradient>
        <pattern id={id("knurl")} width="1.6" height="1.6" patternUnits="userSpaceOnUse">
          <path d="M0 1.6 L1.6 0 M0 0 L1.6 1.6" stroke="rgba(0,0,0,0.28)" strokeWidth="0.3" />
        </pattern>
        <clipPath id={id("window")}>
          <rect x="66" y="8.6" width="15" height="6.8" rx="1" />
        </clipPath>
      </defs>

      {pen === "graphgear" && (
        <g>
          {/* 0.5 lead, retractable sleeve, cone */}
          <rect x="0" y="11.5" width="4" height="1" fill="#55575b" />
          <rect x="3" y="11" width="12" height="2" fill={url("chrome")} />
          <polygon points="15,10.6 31,7.4 31,16.6 15,13.4" fill={url("chrome")} />
          {/* Brushed metal grip with rubber pips */}
          <rect x="31" y="7" width="62" height="10" rx="0.8" fill={url("brushed")} />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} fill="#151617">
              <ellipse cx={35 + i * 6} cy="9.2" rx="1.6" ry="0.9" />
              <ellipse cx={38 + i * 6} cy="12" rx="1.6" ry="0.9" />
              <ellipse cx={35 + i * 6} cy="14.8" rx="1.6" ry="0.9" />
            </g>
          ))}
          <rect x="93" y="6.6" width="4" height="10.8" fill={url("chrome")} />
          {/* Black barrel */}
          <rect x="97" y="6.8" width="166" height="10.4" fill={url("black")} />
          <rect x="97" y="8" width="166" height="1" fill="#fff" opacity="0.16" />
          <text x="108" y="13.4" fontSize="4" letterSpacing="0.7" fill="#cfd1d4" fontFamily="Arial, sans-serif">
            GRAPH GEAR 1000
          </text>
          <text x="205" y="13.4" fontSize="4" fontStyle="italic" fill="#cfd1d4" fontFamily="Arial, sans-serif">
            Pentel
          </text>
          {/* Top section with lead-grade window and knock */}
          <polygon points="263,6.8 290,7.6 290,16.4 263,17.2" fill={url("chrome")} />
          <rect x="271" y="9.6" width="10" height="4.8" rx="0.6" fill="#18191a" />
          <text x="272.6" y="13.3" fontSize="3.4" fill="#f2f2f2" fontFamily="Arial, sans-serif">
            HB
          </text>
          <rect x="290" y="8.4" width="8" height="7.2" rx="2" fill={url("chrome")} />
          {/* Wide spring-loaded clip */}
          <rect x="179" y="6.5" width="80" height="0.7" fill="#000" opacity="0.4" />
          <path
            d="M176 6.2 Q176 3.4 179.5 3.4 L257 3.4 Q268 3.2 271 6.8 L262 6.8 Q258.5 5.4 255 5.4 L179.5 5.4 Q177.5 5.4 176 6.2 Z"
            fill={url("chrome")}
          />
        </g>
      )}

      {pen === "kurutoga" && (
        <g>
          {/* 0.7 lead — a touch thicker than the GraphGear's 0.5 */}
          <rect x="0" y="11.3" width="4" height="1.4" fill="#55575b" />
          <rect x="3" y="11" width="11" height="2" fill={url("chrome")} />
          <polygon points="14,10.6 30,7.4 30,16.6 14,13.4" fill={url("chrome")} />
          {/* Knurled aluminium grip */}
          <rect x="30" y="7" width="58" height="10" fill={url("brushed")} />
          <rect x="30" y="7" width="58" height="10" fill={url("knurl")} />
          {/* Engine window — the gear turns 9° every stroke */}
          <rect x="66" y="8.6" width="15" height="6.8" rx="1" fill="#0f1215" />
          <g clipPath={url("window")}>
            <g
              transform={`rotate(${engine * 9} 73.5 12)`}
              style={{ transition: "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
            >
              <circle cx="73.5" cy="12" r="5.2" fill="#9ea3a9" />
              {Array.from({ length: 16 }, (_, i) => (
                <rect
                  key={i}
                  x="73"
                  y="6.2"
                  width="1"
                  height="1.4"
                  fill="#c9cdd2"
                  transform={`rotate(${i * 22.5} 73.5 12)`}
                />
              ))}
              <circle cx="73.5" cy="12" r="3.2" fill="#6c7279" />
              <rect x="72.6" y="8.9" width="1.8" height="2.2" rx="0.4" fill="#e8a33d" />
              <circle cx="73.5" cy="12" r="0.9" fill="#2b2f34" />
            </g>
          </g>
          <rect x="66" y="8.6" width="15" height="1.2" fill="#fff" opacity="0.18" />
          <rect x="88" y="6.8" width="3" height="10.4" fill={url("chrome")} />
          {/* Gunmetal barrel */}
          <rect x="91" y="6.9" width="177" height="10.2" fill={url("gunmetal")} />
          <rect x="91" y="8" width="177" height="0.9" fill="#fff" opacity="0.18" />
          <text x="104" y="13.4" fontSize="4" letterSpacing="0.8" fill="#dfe2e6" fontFamily="Arial, sans-serif">
            KURU TOGA
          </text>
          <text x="214" y="13.6" fontSize="4.6" fontWeight="bold" fill="#dfe2e6" fontFamily="Arial, sans-serif">
            uni
          </text>
          {/* Top cap and knock */}
          <polygon points="268,6.9 291,7.8 291,16.2 268,17.1" fill={url("chrome")} />
          <rect x="291" y="8.6" width="7" height="6.8" rx="2" fill={url("chrome")} />
          {/* Slim pocket clip */}
          <rect x="194" y="6.5" width="64" height="0.6" fill="#000" opacity="0.4" />
          <path
            d="M190 6.2 Q190 4.2 192.5 4.2 L261 4.2 Q267 4.2 269 6.9 L263 6.9 Q261 5.6 259 5.6 L192.5 5.6 Q191 5.6 190 6.2 Z"
            fill={url("chrome")}
          />
        </g>
      )}

      {pen === "jm20" && (
        <g>
          {/* Delta nib: arrowhead cover around a thin core */}
          <polygon points="0,12 15,8.4 21,8.6 21,15.4 15,15.6" fill={url("nib")} />
          <line x1="0.8" y1="12" x2="21" y2="12" stroke="#5f656c" strokeWidth="0.5" />
          <line x1="0" y1="12" x2="2.4" y2="12" stroke="#c3172a" strokeWidth="0.9" />
          {/* Section and black barrel */}
          <polygon points="21,8.3 40,7.2 40,16.8 21,15.7" fill={url("black")} />
          <rect x="40" y="6.9" width="164" height="10.2" fill={url("black")} />
          <rect x="40" y="8" width="164" height="1" fill="#fff" opacity="0.16" />
          <text x="58" y="13.4" fontSize="4" fontStyle="italic" fill="#c9cbce" fontFamily="Arial, sans-serif">
            Pentel
          </text>
          <text x="82" y="13.3" fontSize="3.4" letterSpacing="0.6" fill="#9c9fa3" fontFamily="Arial, sans-serif">
            TRADIO PULAMAN
          </text>
          {/* Cap posted on the end — red accent shows the ink */}
          <rect x="198" y="6.1" width="92" height="11.8" rx="1" fill={url("black")} />
          <rect x="198" y="6.1" width="2.4" height="11.8" fill={url("red")} />
          <rect x="198" y="7.4" width="92" height="1" fill="#fff" opacity="0.16" />
          <path d="M290 6.1 Q299 6.4 299 12 Q299 17.6 290 17.9 Z" fill={url("red")} />
          {/* Metal clip */}
          <rect x="214" y="6.6" width="72" height="0.6" fill="#000" opacity="0.45" />
          <path
            d="M210 6.1 Q210 3.2 213 3.2 L286 3.2 Q291 3.2 292 6.1 Z"
            fill={url("chrome")}
          />
        </g>
      )}

      {pen === "eraser" && (
        <g>
          {/* Stick eraser: white rubber nose in a paper sleeve */}
          <rect x="0" y="4" width="64" height="16" rx="3" fill={url("rubber")} />
          <rect x="58" y="3.4" width="182" height="17.2" fill={url("sleeve")} />
          <rect x="58" y="10.6" width="182" height="2.8" fill="#f4f4f2" opacity="0.92" />
          <rect x="58" y="3.4" width="5" height="17.2" fill="#1b1c1e" />
          <rect x="58" y="5" width="182" height="1.2" fill="#fff" opacity="0.2" />
        </g>
      )}
      </g>
    </svg>
  );
}
