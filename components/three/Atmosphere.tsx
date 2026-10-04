"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { palette, type SceneTheme } from "./palette";

/**
 * The air in the room.
 *
 * Everything here is doing the job a post-processing stack would normally do
 * — bloom around the screen, a visible shaft of light, a ground that reads as
 * a floor — without one. @react-three/postprocessing would add roughly 40kB
 * and a second full-screen render pass for effects that, at this scale, three
 * hand-written transparent meshes produce more controllably. There is no
 * EffectComposer in this scene on purpose.
 */

/* -------------------------------------------------------------------------
   A shaft of light leaving the monitor.
   The fresnel term is the whole trick: a real volume is brightest where you
   look through the most of it, which is at the grazing edges of the cone.
   ---------------------------------------------------------------------- */
export function LightCone({
  theme,
  radius,
  height,
  color,
  opacity,
  ...props
}: {
  theme: SceneTheme;
  radius: number;
  height: number;
  color: string;
  opacity: number;
} & React.ComponentProps<"group">) {
  const p = palette(theme);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity * p.glow },
      uTime: { value: 0 },
    }),
    // Rebuilt when the substrate changes; every input is already a dep.
    [color, opacity, p.glow],
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (u) u.uTime.value += dt;
  });

  return (
    <group {...props}>
      <mesh>
        <coneGeometry args={[radius, height, 28, 1, true]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={
            theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending
          }
          vertexShader={/* glsl */ `
            varying float vY;
            varying vec3 vN;
            varying vec3 vV;
            void main() {
              // ConeGeometry runs base -> apex along +Y. Normalise to 0 at
              // the apex so the brightness can key off distance travelled.
              vY = 0.5 - position.y;
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vV = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uTime;
            varying float vY;
            varying vec3 vN;
            varying vec3 vV;

            void main() {
              float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
              float along = 1.0 - clamp(vY, 0.0, 1.0);
              // Falls off down the shaft, and off entirely at the far end.
              float a = pow(along, 1.4) * smoothstep(1.0, 0.45, vY);
              // The slow unevenness of air. Very small — any more and it
              // reads as a texture rather than as dust in a beam.
              a *= 0.92 + sin(uTime * 0.7 + vY * 5.0) * 0.08;
              a *= fres * uOpacity;
              if (a < 0.003) discard;
              gl_FragColor = vec4(uColor, a);
            }
          `}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------
   The floor.
   A polar grid rather than a lit disc: a disc in the dark reads as a visible
   disc and gives the whole thing away as a prop on a stand, where rings and
   spokes fading into nothing read as a datum the desk is standing on.
   ---------------------------------------------------------------------- */
export function Ground({ theme }: { theme: SceneTheme }) {
  const p = palette(theme);
  const light = theme === "light";

  const uniforms = useMemo(
    () => ({
      uGrid: { value: new THREE.Color(light ? p.amber : p.screen) },
      uPool: { value: new THREE.Color(p.screen) },
      uShade: { value: new THREE.Color("#2a2317") },
      uGridA: { value: light ? 0.09 : 0.13 },
      // Dark room: a pool of screen light does the grounding. Bright room:
      // an actual contact shadow does, because there is light to block.
      uPoolA: { value: light ? 0.0 : 0.05 },
      uShadeA: { value: light ? 0.3 : 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.28]}>
      <planeGeometry args={[3.6, 3.6]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uGrid;
          uniform vec3 uPool;
          uniform vec3 uShade;
          uniform float uGridA;
          uniform float uPoolA;
          uniform float uShadeA;
          varying vec2 vUv;

          void main() {
            vec2 q = (vUv - 0.5) * 2.0;
            float r = length(q);
            float fade = smoothstep(1.0, 0.1, r);

            // Concentric rings, antialiased against their own derivative so
            // they stay one pixel wide at every distance.
            float rr = r * 7.0;
            float ring = abs(fract(rr) - 0.5);
            ring = 1.0 - smoothstep(0.0, fwidth(rr) * 1.6, ring);

            // Radial spokes, thinning out toward the centre where they crowd.
            float ang = atan(q.y, q.x) / 6.2831853;
            float ss = ang * 24.0;
            float spoke = abs(fract(ss) - 0.5);
            spoke = 1.0 - smoothstep(0.0, fwidth(ss) * 1.8, spoke);
            spoke *= smoothstep(0.12, 0.5, r);

            float grid = (ring * 0.75 + spoke * 0.45) * fade * uGridA;
            float pool = smoothstep(0.75, 0.0, r) * uPoolA;
            float shade = pow(smoothstep(0.62, 0.0, r), 1.6) * uShadeA;

            vec3 col = uGrid * grid + uPool * pool + uShade * shade;
            float a = grid + pool + shade;
            if (a < 0.002) discard;
            gl_FragColor = vec4(col / max(a, 0.001), a);
          }
        `}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------
   Bloom around the panel, as a billboard.
   ---------------------------------------------------------------------- */
export function Glow({
  theme,
  size,
  intensity = 1,
  ...props
}: {
  theme: SceneTheme;
  size: number;
  intensity?: number;
} & React.ComponentProps<"mesh">) {
  const p = palette(theme);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(p.screen) },
      uOpacity: { value: intensity * p.glow },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, intensity],
  );

  if (p.glow < 0.25) return null;

  return (
    <mesh {...props}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = pow(smoothstep(1.0, 0.0, d), 2.2) * uOpacity;
            if (a < 0.003) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `}
      />
    </mesh>
  );
}
