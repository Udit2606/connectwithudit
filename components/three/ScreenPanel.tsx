"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SCREEN_LINES } from "@/data/screen";
import { palette, type SceneTheme } from "./palette";

const W = 1024;
const H = 580;

/** Milliseconds per character, typing and deleting. */
const TYPE_MS = 46;
const DELETE_MS = 20;
/** How long a finished line holds before it is taken back. */
const HOLD_MS = 2800;
/** The beat between one line clearing and the next starting. */
const PAUSE_MS = 420;
const CARET_MS = 520;

type Phase = "typing" | "holding" | "deleting" | "pause";

/**
 * The monitor panel, drawn into a canvas and used as a texture.
 *
 * A canvas texture is the right tool here: it needs no font file fetched into
 * the 3D layer, it can use the page's own typeface once `document.fonts` is
 * ready, and the text can be redrawn whenever it changes without rebuilding
 * any geometry.
 *
 * The line types itself in and is taken back out again, which is the same
 * conceit as the arrival overlay — and it is the reason the whole state
 * machine lives in a ref driven by `useFrame` rather than in React state. At
 * one re-render per character this would be ~50 renders of the hero a second;
 * as a ref it is a canvas redraw and a texture upload, and React never hears
 * about it.
 */
export function ScreenPanel({
  width,
  height,
  theme,
}: {
  width: number;
  height: number;
  theme: SceneTheme;
}) {
  const p = palette(theme);
  const fontsReady = useRef(false);

  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  // Wait for the webfont, or the first paint falls back to a system serif.
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) fontsReady.current = true;
    });
    return () => {
      alive = false;
    };
  }, []);

  const state = useRef({
    index: 0,
    chars: 0,
    phase: "typing" as Phase,
    elapsed: 0,
    caretOn: true,
    caretT: 0,
    /** What was last committed to the canvas, so we only redraw on change. */
    drawn: "",
  });

  /* ------------------------------------------------------------------ draw */
  const paint = (chars: number, index: number, caretOn: boolean) => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const light = theme === "light";
    const line = SCREEN_LINES[index];
    const shown = line.slice(0, chars);

    ctx.clearRect(0, 0, W, H);

    // Panel: brighter toward the centre, the way a backlight actually falls.
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72);
    bg.addColorStop(0, light ? "#fffaf1" : "#2b1a0b");
    bg.addColorStop(1, p.panel);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* An editor gutter and some lines of nothing in particular, so the
       panel reads as a working machine rather than as a lit rectangle with
       a sentence on it. The rows stop short of the middle band where the
       tagline sits — running them underneath it just made both unreadable. */
    const gutter = light ? "rgba(69,33,10,0.13)" : "rgba(255,154,60,0.13)";
    ctx.fillStyle = gutter;
    for (let i = 0; i < 15; i++) {
      const y = 54 + i * 33;
      if (y > H * 0.38 && y < H * 0.64) continue;
      ctx.fillRect(58, y, 13, 3);
      ctx.fillRect(90, y, 60 + ((i * 97) % 300), 3);
      if (i % 3 === 1) ctx.fillRect(170 + ((i * 53) % 220), y, 90, 3);
    }

    // A soft band of backlight under the line, so the type sits in light
    // rather than floating on a flat field.
    const band = ctx.createLinearGradient(0, H * 0.34, 0, H * 0.68);
    band.addColorStop(0, "rgba(255,176,102,0)");
    band.addColorStop(0.5, light ? "rgba(255,210,150,0.3)" : "rgba(255,176,102,0.13)");
    band.addColorStop(1, "rgba(255,176,102,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, H * 0.34, W * 0.82, H * 0.34);

    /*
     * Fit the line to the panel rather than trusting a fixed size. The two
     * taglines have different widths, the webfont may or may not have
     * arrived yet, and the caret needs room after the text — so measure the
     * *full* line, not the typed portion, and step down until it clears the
     * safe inner width. Measuring the typed portion would make the type
     * grow and shrink as it went in.
     *
     * The safe box is not centred, and that is the point: the figure sits
     * between the camera and the right-hand end of this panel, so its head
     * covers roughly the last sixth of it. A line centred in the panel loses
     * its last two words and its caret behind a silhouette. The text is laid
     * out centred inside a box that stops short of where the head is, which
     * keeps it optically balanced against the visible part of the screen
     * instead of against the geometry.
     */
    const serif = fontsReady.current
      ? '"Instrument Serif", Georgia, serif'
      : "Georgia, serif";
    const BOX_LEFT = W * 0.06;
    const BOX_RIGHT = W * 0.72;
    const BOX_W = BOX_RIGHT - BOX_LEFT;
    const CARET_ROOM = 30;
    let size = 70;
    ctx.font = `${size}px ${serif}`;
    while (ctx.measureText(line).width + CARET_ROOM > BOX_W && size > 28) {
      size -= 2;
      ctx.font = `${size}px ${serif}`;
    }

    /* Left-aligned from where the finished line *would* start, so the text
       grows rightward out of a fixed point instead of sliding sideways under
       a centred origin. */
    const full = ctx.measureText(line).width;
    const startX = BOX_LEFT + (BOX_W - full - CARET_ROOM) / 2;
    const baseY = H / 2;

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = index === 0 ? p.panelInk : p.panelDim;
    if (!light) {
      ctx.shadowColor = "rgba(255,176,102,0.5)";
      ctx.shadowBlur = 28;
    }
    ctx.fillText(shown, startX, baseY);
    ctx.shadowBlur = 0;

    // The caret, sitting right after whatever has been typed so far.
    if (caretOn) {
      const w = ctx.measureText(shown).width;
      ctx.fillStyle = light ? "rgba(176,76,6,0.85)" : "rgba(255,176,102,0.85)";
      ctx.fillRect(startX + w + 10, baseY - size * 0.44, 5, size * 0.88);
    }

    // Scanlines. Two pixels on, two off — the thing that stops a flat fill
    // from reading as a coloured rectangle.
    ctx.fillStyle = light ? "rgba(69,33,10,0.035)" : "rgba(0,0,0,0.11)";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

    // Corner falloff.
    const vig = ctx.createRadialGradient(
      W / 2,
      H / 2,
      H * 0.3,
      W / 2,
      H / 2,
      W * 0.72,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, light ? "rgba(69,33,10,0.14)" : "rgba(0,0,0,0.3)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Top chrome bar, with a filename.
    ctx.fillStyle = light ? "rgba(69,33,10,0.06)" : "rgba(244,241,234,0.07)";
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = light ? "rgba(176,76,6,0.7)" : "rgba(255,154,60,0.55)";
    ctx.beginPath();
    ctx.arc(28, 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '15px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = light ? "rgba(69,33,10,0.45)" : "rgba(244,241,234,0.3)";
    ctx.fillText("scratch.md", 48, 19);

    texture.needsUpdate = true;
  };

  /* ---------------------------------------------------------------- drive */
  useFrame((_, delta) => {
    const s = state.current;
    const ms = Math.min(delta, 0.05) * 1000;
    const line = SCREEN_LINES[s.index];

    s.elapsed += ms;
    s.caretT += ms;
    if (s.caretT >= CARET_MS) {
      s.caretT = 0;
      // The caret is solid while characters are going down — a blink that
      // fights the typing just looks like a dropped frame.
      s.caretOn = s.phase === "typing" ? true : !s.caretOn;
    }

    switch (s.phase) {
      case "typing":
        if (s.elapsed >= TYPE_MS) {
          s.elapsed = 0;
          s.chars = Math.min(s.chars + 1, line.length);
          if (s.chars === line.length) {
            s.phase = "holding";
            s.caretOn = true;
            s.caretT = 0;
          }
        }
        break;
      case "holding":
        if (s.elapsed >= HOLD_MS) {
          s.elapsed = 0;
          s.phase = "deleting";
        }
        break;
      case "deleting":
        if (s.elapsed >= DELETE_MS) {
          s.elapsed = 0;
          s.chars = Math.max(s.chars - 1, 0);
          if (s.chars === 0) {
            s.phase = "pause";
            s.index = (s.index + 1) % SCREEN_LINES.length;
          }
        }
        break;
      case "pause":
        if (s.elapsed >= PAUSE_MS) {
          s.elapsed = 0;
          s.phase = "typing";
        }
        break;
    }

    // Redraw only when the picture has actually changed.
    const key = `${s.index}:${s.chars}:${s.caretOn ? 1 : 0}:${
      fontsReady.current ? 1 : 0
    }:${theme}`;
    if (key !== s.drawn) {
      s.drawn = key;
      paint(s.chars, s.index, s.caretOn);
    }
  });

  if (!texture) {
    // SSR / no-document path: a plain warm panel rather than nothing.
    return (
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={p.screen} toneMapped={false} />
      </mesh>
    );
  }

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent={false} />
    </mesh>
  );
}
