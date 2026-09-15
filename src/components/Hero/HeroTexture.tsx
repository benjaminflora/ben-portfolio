"use client";

import { useEffect, useRef } from "react";
import { LAND_H, LAND_MASK_B64, LAND_W } from "./earthLandMask";
import styles from "./HeroTexture.module.css";

const CELL = 3;
const EARTH_WIDTH = 720;
const EARTH_HEIGHT = 360;
const SPIN = 0.018;
const RIPPLE_SPEED = 140;
const RIPPLE_LIFE = 1.4;
const RIPPLE_WIDTH = 36;

type Satellite = {
  name: string;
  speed: number;
  phase: number;
  inc: number;
  node: number;
};

const SATELLITES: Satellite[] = [
  { name: "ISS", speed: 0.07, phase: 0.12, inc: 0.26, node: 0.08 },
  { name: "NOAA-21", speed: -0.055, phase: 0.48, inc: 0.18, node: 0.41 },
  { name: "GPS IIF", speed: 0.09, phase: 0.73, inc: 0.22, node: 0.62 },
];

const SAT_BODY: [number, number][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

type Ripple = { x: number; y: number; born: number };

const LAND_BITS = decodeMask(LAND_MASK_B64);

function decodeMask(b64: string) {
  const bin = atob(b64);
  const bits = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
  return bits;
}

function landBit(x: number, y: number) {
  const ix = ((x % LAND_W) + LAND_W) % LAND_W;
  const iy = Math.min(LAND_H - 1, Math.max(0, y));
  const i = iy * LAND_W + ix;
  return (LAND_BITS[i >> 3] >> (7 - (i & 7))) & 1;
}

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  return (
    hash2(x0, y0) * (1 - u) * (1 - v) +
    hash2(x0 + 1, y0) * u * (1 - v) +
    hash2(x0, y0 + 1) * (1 - u) * v +
    hash2(x0 + 1, y0 + 1) * u * v
  );
}

function wrap(value: number) {
  return value - Math.floor(value);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function landAmount(lon: number, lat: number) {
  const x = wrap(lon) * LAND_W - 0.5;
  const y = lat * LAND_H - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;

  const coverage =
    landBit(x0, y0) * (1 - fx) * (1 - fy) +
    landBit(x0 + 1, y0) * fx * (1 - fy) +
    landBit(x0, y0 + 1) * (1 - fx) * fy +
    landBit(x0 + 1, y0 + 1) * fx * fy;

  if (coverage <= 0) return 0;

  const relief = 0.78 + valueNoise(lon * 7.5, lat * 9.5) * 0.22;
  return coverage * relief;
}

function satellitePoint(sat: Satellite, time: number) {
  const u = wrap(time * sat.speed + sat.phase);
  const lon = wrap(sat.node + u);
  const lat = 0.5 + Math.sin(u * Math.PI * 2) * sat.inc;
  return { lon, lat };
}

export function HeroTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const parent = canvas.closest("section") ?? canvas.parentElement;
    if (!parent) return;

    const ripples: Ripple[] = [];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cssW = 0;
    let cssH = 0;
    let fadeStart = 0;
    let fadeEnd = 0;
    let frame = 0;
    let running = true;

    const measureCopy = () => {
      const copy = parent.querySelector("[data-hero-copy]");
      const parentRect = parent.getBoundingClientRect();
      const heading =
        copy instanceof HTMLElement
          ? copy.querySelector('[role="heading"]')
          : null;
      const target =
        heading instanceof HTMLElement
          ? heading
          : copy instanceof HTMLElement
            ? copy
            : null;
      if (!target) {
        fadeStart = parentRect.width * 0.48;
        fadeEnd = parentRect.width * 0.74;
        return;
      }
      const textRect = target.getBoundingClientRect();
      const start = Math.max(0, textRect.right - parentRect.left);
      fadeStart = start;
      fadeEnd = start + 72;
    };

    const syncSize = () => {
      const rect = parent.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor(rect.width));
      const nextH = Math.max(1, Math.floor(rect.height));
      if (nextW !== cssW || nextH !== cssH) {
        cssW = nextW;
        cssH = nextH;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      measureCopy();
    };

    const draw = (now: number) => {
      if (!running) return;
      syncSize();
      const time = reduceMotion ? 0 : now / 1000;
      ctx.clearRect(0, 0, cssW, cssH);

      const cols = Math.ceil(cssW / CELL);
      const rows = Math.ceil(cssH / CELL);
      const originX = cssW - EARTH_WIDTH - 24;
      const originY = (cssH - EARTH_HEIGHT) / 2;
      const spin = wrap(time * SPIN);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * CELL;
          const y = row * CELL;
          const px = x + CELL / 2;
          const fadeX = smoothstep(fadeStart, fadeEnd, px);
          const fadeY =
            smoothstep(0.08, 0.22, (y + CELL / 2) / cssH) *
            smoothstep(0.92, 0.78, (y + CELL / 2) / cssH);
          const fade = fadeX * fadeY;
          if (fade < 0.04) continue;

          const lon = wrap((x + CELL / 2 - originX) / EARTH_WIDTH + spin);
          const lat = (y + CELL / 2 - originY) / EARTH_HEIGHT;
          if (lat < 0 || lat > 1) continue;

          const land = landAmount(lon, lat);
          if (land <= 0) continue;

          let pulse = 0;
          for (let i = ripples.length - 1; i >= 0; i--) {
            const ripple = ripples[i];
            const age = (now / 1000 - ripple.born) * RIPPLE_LIFE;
            if (age > 1.8) {
              ripples.splice(i, 1);
              continue;
            }
            const dx = x + CELL / 2 - ripple.x;
            const dy = y + CELL / 2 - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ring = dist - age * RIPPLE_SPEED;
            const band = Math.exp(
              -(ring * ring) / (2 * RIPPLE_WIDTH * RIPPLE_WIDTH),
            );
            pulse += band * Math.exp(-age * 1.8);
          }

          const value = Math.min(1, land * 0.84 + pulse * 0.25) * fade;
          const threshold = (BAYER_4[row % 4][col % 4] + 0.5) / 16;
          if (value <= threshold) continue;

          const excess = Math.min(1, (value - threshold) * 2.4);
          const grain = hash2(col + 19.1, row + 7.3);
          const shade = land * 0.4 + excess * 0.25 + grain * 0.35;
          const gray = Math.round(148 - shade * 22);
          const alpha = 0.32 + shade * 0.1;
          ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
          ctx.fillRect(x, y, CELL - 0.5, CELL - 0.5);
        }
      }

      const fadeAt = (px: number, py: number) => {
        const fadeX = smoothstep(fadeStart, fadeEnd, px);
        const ny = py / cssH;
        return (
          fadeX *
          smoothstep(0.08, 0.22, ny) *
          smoothstep(0.92, 0.78, ny)
        );
      };

      const projectSat = (lon: number, lat: number) => {
        const sx = originX + wrap(lon - spin) * EARTH_WIDTH;
        const sy = originY + lat * EARTH_HEIGHT;
        return { sx, sy };
      };

      const paintCell = (
        col: number,
        row: number,
        r: number,
        g: number,
        b: number,
        alpha: number,
      ) => {
        const x = col * CELL;
        const y = row * CELL;
        const fade = fadeAt(x + CELL / 2, y + CELL / 2);
        if (fade < 0.04) return;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * fade})`;
        ctx.fillRect(x, y, CELL - 0.5, CELL - 0.5);
      };

      for (const sat of SATELLITES) {
        const samples = 72;
        for (let i = 0; i < samples; i++) {
          const ahead = (i + 1) / samples;
          const point = satellitePoint(sat, time - ahead * 2.8);
          const { sx, sy } = projectSat(point.lon, point.lat);
          const col = Math.round(sx / CELL);
          const row = Math.round(sy / CELL);
          if ((col + row + i) % 2 !== 0) continue;
          const trail = 1 - i / samples;
          const r = Math.round(242 - trail * 22);
          const g = Math.round(188 - trail * 70);
          const b = Math.round(158 - trail * 78);
          paintCell(col, row, r, g, b, 0.18 + trail * 0.42);
        }

        const nowPos = satellitePoint(sat, time);
        const { sx, sy } = projectSat(nowPos.lon, nowPos.lat);
        const col = Math.round(sx / CELL);
        const row = Math.round(sy / CELL);
        for (const [dx, dy] of SAT_BODY) {
          const dist = Math.abs(dx) + Math.abs(dy);
          const t = Math.min(1, dist / 4);
          const r = Math.round(220 - t * 12);
          const g = Math.round(118 - t * 10);
          const b = Math.round(80 - t * 8);
          const alpha = dist === 0 ? 0.82 : 0.62;
          paintCell(col + dx, row + dy, r, g, b, alpha);
        }

        const labelX = sx + CELL * 4;
        const labelY = sy - 2;
        const fade = fadeAt(labelX, labelY);
        if (fade >= 0.08) {
          ctx.save();
          ctx.font = "12px var(--font-geist), Geist, system-ui, sans-serif";
          ctx.fillStyle = `rgba(214, 122, 86, ${0.75 * fade})`;
          ctx.textBaseline = "middle";
          ctx.textAlign = "left";
          ctx.fillText(sat.name, labelX, labelY);
          ctx.restore();
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      if (x < fadeStart) return;
      ripples.push({
        x,
        y: event.clientY - rect.top,
        born: performance.now() / 1000,
      });
    };

    parent.addEventListener("click", onClick);
    const copy = parent.querySelector("[data-hero-copy]");
    const observer = new ResizeObserver(() => {
      measureCopy();
    });
    observer.observe(parent);
    if (copy instanceof HTMLElement) observer.observe(copy);
    frame = window.requestAnimationFrame(draw);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      parent.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
  );
}
