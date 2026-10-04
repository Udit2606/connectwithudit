"use client";

import { AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

import { DeskScene } from "./DeskScene";
import { Dust } from "./Dust";
import { palette, type SceneTheme } from "./palette";

type HeroCanvasProps = {
  progress: React.RefObject<number>;
  quality: "mid" | "high";
  dprCap: [number, number];
  theme: SceneTheme;
};

/**
 * Fog and exposure, kept in step with the substrate.
 *
 * The fog colour has to *be* the page background. Anything else and the room
 * fades out into a haze of the wrong colour, which turns the scene into a
 * visible rectangle sitting on the page instead of a hole cut into it. This
 * lives in a child component because both values belong to the renderer and
 * the scene, not to the React tree, and they have to be reassigned rather
 * than re-rendered when the theme changes.
 */
function Atmospherics({ theme }: { theme: SceneTheme }) {
  const { gl, scene } = useThree();
  const p = palette(theme);

  useEffect(() => {
    gl.toneMappingExposure = p.exposure;
    // Close fog: the room should fall away into nothing just past the desk.
    scene.fog = new THREE.Fog(p.fog, 5.5, 12);
    return () => {
      scene.fog = null;
    };
  }, [gl, scene, p.exposure, p.fog]);

  return null;
}

/**
 * Canvas + lighting for the hero diorama.
 *
 * No HDRI is fetched: the environment is built from Lightformers, so the
 * reflections are authored, offline, and free. It is baked once per substrate
 * — `frames={1}` means changing a Lightformer prop does nothing, so the whole
 * Environment is keyed on the theme and re-baked on a switch.
 *
 * There is no pointer handler here any more. See DeskScene for why.
 */
export default function HeroCanvas({
  progress,
  quality,
  dprCap,
  theme,
}: HeroCanvasProps) {
  const p = palette(theme);
  const light = theme === "light";

  return (
    <Canvas
      dpr={dprCap}
      gl={{
        antialias: quality === "high",
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 1.4, 2.95], fov: 36, near: 0.05, far: 40 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
      style={{ pointerEvents: "none" }}
    >
      <Atmospherics theme={theme} />

      {/* Dark: barely there — the screen does the lighting and the room is
          dark. Light: there is a window in the room, so the top light is the
          dominant source and the screen is a secondary one. */}
      <directionalLight
        position={[3, 5, 2.5]}
        intensity={light ? 1.5 : 0.18}
        color={light ? "#fff6e9" : "#aab6cc"}
      />
      <ambientLight intensity={p.ambient} color={light ? "#e8eaf0" : "#8c97b0"} />

      <Environment key={theme} resolution={quality === "high" ? 256 : 128} frames={1}>
        {/* Soft overhead strip — the long highlight down each plate edge. */}
        <Lightformer
          form="rect"
          intensity={light ? 2.6 : 0.4}
          color="#ffffff"
          position={[0, 5, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[9, 4, 1]}
        />
        {/* Amber wrap, low and behind — the warmth in the reflections.
            Kept modest: this is image-based light, so it reaches every
            surface including the ones facing the camera, and at the
            intensity this started on it was lighting the figure's back
            brightly enough to cancel the backlit silhouette entirely. */}
        <Lightformer
          form="rect"
          intensity={light ? 0.9 : 1.1}
          color={p.amber}
          position={[-4, -1, -3]}
          rotation={[0, Math.PI / 2.4, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="circle"
          intensity={light ? 2.2 : 1.6}
          color={light ? "#dfe6f2" : "#8ea2c4"}
          position={[4.5, 1.5, 2]}
          scale={[4, 4, 1]}
        />
      </Environment>

      <DeskScene progress={progress} quality={quality} theme={theme} />
      <Dust theme={theme} count={quality === "high" ? 460 : 240} />

      {/* Drops resolution automatically if frames start costing too much. */}
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
