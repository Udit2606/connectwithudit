"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { palette, type SceneTheme } from "./palette";

/**
 * Ambient motes in the surrounding volume. Pure depth cue — it gives the
 * sculpture air around it so it reads as photographed rather than pasted on.
 */
export function Dust({
  count = 420,
  theme,
}: {
  count?: number;
  theme: SceneTheme;
}) {
  const p = palette(theme);
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spherical shell, biased outward, so the centre stays legible.
      const r = 1.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.random() * 3.4;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      size[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(size, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(p.dust) },
      // On paper these are specks of dust, not glints of light, so they get
      // dialled right back — the same alpha that reads as air on black reads
      // as a dirty screen on white.
      uInk: { value: theme === "light" ? 0.42 : 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={
          theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending
        }
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          varying float vSeed;
          void main() {
            vSeed = aSeed;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (0.6 + aSeed * 1.2) * (16.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uInk;
          varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * (0.18 + vSeed * 0.34) * uInk;
            if (a < 0.004) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `}
      />
    </points>
  );
}
