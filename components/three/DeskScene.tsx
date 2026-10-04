"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { damp } from "@/lib/utils/math";
import { Ground } from "./Atmosphere";
import { DeskDiorama } from "./DeskDiorama";
import { Dreams } from "./Dreams";
import { palette, type SceneTheme } from "./palette";

type Props = {
  progress: React.RefObject<number>;
  quality: "mid" | "high";
  theme: SceneTheme;
};

/**
 * The hero scene: someone at a desk, late, thinking about what comes next.
 *
 * The camera sits behind and slightly to one side of the figure, so the
 * monitor faces the viewer and the person reads as a silhouette against it.
 * That is the one arrangement that gets both — a legible screen and a figure
 * made entirely of outline — out of a single light source.
 *
 * On scroll the camera rises away from the desk and toward the drifting
 * geometry: leaving the room, entering the ambition.
 *
 * Nothing here follows the pointer. The scene used to rotate toward the
 * cursor, which had two problems: it made a quiet, observed moment feel like
 * a toy, and it tied the composition to where someone happened to leave the
 * mouse — including dead centre over the wordmark. Instead the camera and the
 * diorama both drift on their own slow, irrational cycles, so the view is
 * never quite the same twice and never waiting to be poked.
 */
export function DeskScene({ progress, quality, theme }: Props) {
  const group = useRef<THREE.Group>(null);
  const screenLight = useRef<THREE.PointLight>(null);
  const lampLight = useRef<THREE.PointLight>(null);
  const bounce = useRef<THREE.PointLight>(null);
  const { camera, size } = useThree();

  const p = palette(theme);

  // On wide viewports the scene sits right of centre so the wordmark owns the
  // left third. On narrow screens it recentres and pulls back.
  const wide = size.width / size.height > 1.15;
  const offsetX = wide ? 2.15 : 0;
  const baseScale = wide ? 1.45 : 1;

  /** The rest pose. Drift is measured against this, never accumulated. */
  const BASE_ROT_Y = Math.PI - 0.52;

  useEffect(() => {
    // The diorama should not start mid-swing when the canvas mounts.
    if (group.current) group.current.rotation.set(0, BASE_ROT_Y, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const pr = progress.current ?? 0;
    const t = state.clock.elapsedTime;

    if (group.current) {
      /* Two incommensurable periods, so the pair never repeats on any beat
         a viewer could learn. Amplitudes are a third of what the pointer
         version used: this reads as the object breathing, not as motion. */
      const driftY = Math.sin(t * 0.083) * 0.05 + Math.sin(t * 0.031) * 0.025;
      const driftX = Math.sin(t * 0.061) * 0.018;
      group.current.rotation.y = damp(
        group.current.rotation.y,
        BASE_ROT_Y + driftY,
        2.2,
        dt,
      );
      group.current.rotation.x = damp(group.current.rotation.x, driftX, 2.2, dt);
      group.current.position.x = damp(group.current.position.x, offsetX, 5, dt);
      group.current.position.y = Math.sin(t * 0.14) * 0.012;
    }

    // The screen flickers the way a screen does — barely.
    if (screenLight.current) {
      const flicker = 1 + Math.sin(t * 7.3) * 0.015 + Math.sin(t * 2.1) * 0.03;
      screenLight.current.intensity =
        1.45 * p.key * flicker * Math.max(0, 1 - pr * 1.1);
    }
    if (lampLight.current) {
      lampLight.current.intensity = 0.7 * p.key * Math.max(0, 1 - pr * 1.1);
    }
    if (bounce.current) {
      bounce.current.intensity = 0.16 * p.key * Math.max(0, 1 - pr * 1.1);
    }

    // Rise off the desk and into the drifting geometry, with a slow handheld
    // float on top so the frame is never locked off.
    camera.position.x = damp(
      camera.position.x,
      offsetX + Math.sin(t * 0.11) * 0.07,
      3,
      dt,
    );
    camera.position.y = damp(
      camera.position.y,
      1.4 + pr * 1.6 + Math.sin(t * 0.17) * 0.03,
      4,
      dt,
    );
    camera.position.z = damp(
      camera.position.z,
      2.95 + pr * 1.3 + Math.sin(t * 0.07) * 0.05,
      4,
      dt,
    );
    camera.lookAt(
      offsetX + Math.sin(t * 0.09) * 0.03,
      0.95 + pr * 1.4,
      0,
    );
  });

  return (
    <group
      ref={group}
      position={[offsetX, 0, 0]}
      rotation={[0, BASE_ROT_Y, 0]}
      scale={baseScale}
    >
      <DeskDiorama theme={theme} />
      <Dreams theme={theme} progress={progress} quality={quality} />
      <Ground theme={theme} />

      {/*
        Key light, placed just in front of the figure rather than at the panel.
        At the panel it sat between the figure and the monitor and lit the back
        of the monitor as brightly as the person — so the range is kept short
        enough to fall off before it reaches the shell.
      */}
      <pointLight
        ref={screenLight}
        color={p.screen}
        intensity={1.45 * p.key}
        distance={1.45}
        decay={2}
        position={[0, 0.64, 0.3]}
      />
      {/* The desk lamp */}
      <pointLight
        ref={lampLight}
        color={p.amber}
        intensity={0.7 * p.key}
        distance={1.1}
        decay={2}
        position={[-0.5, 0.71, 0.38]}
      />
      {/* Bounce off the desktop, under the chin — the light a real room has
          and a three-light rig always forgets. */}
      <pointLight
        ref={bounce}
        color={p.screen}
        intensity={0.16 * p.key}
        distance={0.9}
        decay={2}
        position={[-0.1, 0.47, 0.42]}
      />
      {/* A cold sliver from behind, to separate the silhouette from the dark.
          It is the only thing drawing an edge on the half of the figure that
          falls outside the panel, so it carries more than its intensity
          suggests. */}
      <directionalLight
        color={p.cool}
        intensity={theme === "light" ? 0.9 : 0.6}
        position={[-2.2, 1.8, -2.4]}
      />
    </group>
  );
}
