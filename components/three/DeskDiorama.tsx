"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { Glow, LightCone } from "./Atmosphere";
import { palette, type SceneTheme } from "./palette";
import { ScreenPanel } from "./ScreenPanel";

/**
 * A seated figure at a desk, lit by the screen in front of it.
 *
 * The figure is kept in near-total shadow and built from capsules and
 * spheres. That is the whole trick: a backlit silhouette reads instantly as a
 * person, where an attempt at a detailed model from primitives only ever
 * reads as a crude mannequin. All the information is in the outline, the
 * proportions and the rim light.
 *
 * What carries the scene past "a shape at a desk" is not more polygons on the
 * body — it is the room around it. The props are the characterisation: a
 * keyboard with actual keycaps, a mug still steaming, a notebook left open, a
 * cable sagging off the back of the desk. And the figure is never still:
 * it breathes, its hands work, and now and then it looks over at the second
 * screen. None of that is driven by the pointer.
 *
 * Everything faces +Z. The camera sits behind and to one side, so the monitor
 * faces the viewer and the person is a silhouette against it.
 */

/** Builds a capsule between two points — the joint-to-joint primitive. */
function Limb({
  from,
  to,
  radius,
  material,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  material: THREE.Material;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    // CapsuleGeometry runs along +Y, so rotate that axis onto the limb.
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: mid, quaternion: q, length: Math.max(len, 0.001) };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <capsuleGeometry args={[radius, length, 6, 12]} />
    </mesh>
  );
}

/** A sagging cable. One tube along a hand-placed catenary. */
function Cable({
  points,
  radius = 0.006,
  material,
}: {
  points: [number, number, number][];
  radius?: number;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    return new THREE.TubeGeometry(curve, 28, radius, 6, false);
  }, [points, radius]);

  return <mesh geometry={geometry} material={material} />;
}

/**
 * Keycaps as one instanced mesh.
 *
 * Fifty-odd individual meshes for a keyboard would be fifty draw calls for
 * something that occupies about forty pixels. One instanced mesh is one.
 */
const KEY_COLS = 13;
const KEY_ROWS = 4;
const KEY_COUNT = KEY_COLS * KEY_ROWS;

function Keycaps({ material }: { material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        m.setPosition(
          -0.1 + c * 0.0167,
          0.0,
          -0.023 + r * 0.0155,
        );
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, KEY_COUNT]}
      material={material}
      frustumCulled={false}
    >
      <boxGeometry args={[0.0128, 0.0042, 0.0118]} />
    </instancedMesh>
  );
}

/** Steam off the mug. Eighteen points is plenty — it only has to suggest. */
function Steam({ theme }: { theme: SceneTheme }) {
  const p = palette(theme);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const COUNT = 18;
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.022;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.022;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.1, 0), 0.4);
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(theme === "light" ? "#8d8880" : p.screen) },
      uOpacity: { value: theme === "light" ? 0.16 : 0.3 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (u) u.uTime.value += dt;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          uniform float uTime;
          varying float vLife;
          void main() {
            float life = fract(aSeed + uTime * 0.11);
            vLife = life;
            vec3 pos = position;
            pos.y += life * 0.16;
            // Curls as it rises, and widens.
            pos.x += sin(uTime * 0.9 + aSeed * 20.0) * life * 0.035;
            pos.z += cos(uTime * 0.75 + aSeed * 14.0) * life * 0.03;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (3.0 + life * 10.0) * (6.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vLife;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            a *= smoothstep(0.0, 0.2, vLife) * (1.0 - smoothstep(0.35, 1.0, vLife));
            a *= uOpacity;
            if (a < 0.004) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `}
      />
    </points>
  );
}

/**
 * The second monitor: code scrolling past, drawn procedurally.
 *
 * A shader rather than a canvas texture — the content is abstract bars, so
 * there is nothing to draw with a 2D context that a hash function will not
 * produce more cheaply, and it scrolls for free.
 */
function ScrollingCode({
  theme,
  width,
  height,
}: {
  theme: SceneTheme;
  width: number;
  height: number;
}) {
  const p = palette(theme);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInk: { value: new THREE.Color(p.amber) },
      uBg: { value: new THREE.Color(p.panel) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (u) u.uTime.value += dt;
  });

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        toneMapped={false}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform vec3 uInk;
          uniform vec3 uBg;
          varying vec2 vUv;

          float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

          void main() {
            // 22 lines of "code", scrolling upward.
            float row = floor((vUv.y + uTime * 0.035) * 22.0);
            float indent = hash(row) * 0.28;
            float len = 0.2 + hash(row + 7.0) * 0.62;
            float inLine = step(0.06 + indent, vUv.x) * step(vUv.x, 0.06 + indent + len);
            // A gap in the middle of some lines, so it reads as tokens.
            float gap = step(0.4, hash(row + 19.0)) *
                        step(0.3 + indent, vUv.x) * step(vUv.x, 0.36 + indent);
            float band = fract((vUv.y + uTime * 0.035) * 22.0);
            float thick = step(0.3, band) * step(band, 0.68);
            float ink = inLine * thick * (1.0 - gap) * (0.3 + hash(row + 3.0) * 0.7);
            gl_FragColor = vec4(mix(uBg, uInk, ink * 0.55), 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function DeskDiorama({ theme }: { theme: SceneTheme }) {
  const p = palette(theme);

  // One material for every dark surface: fewer draw states, consistent read.
  const dark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: p.solid,
        // Very dark and very rough: the screen should graze these surfaces,
        // not light them. Anything brighter and the figure stops reading as a
        // silhouette and starts reading as a beige mannequin.
        roughness: 0.92,
        metalness: 0.0,
        /* And this is the lever that actually holds it there. The authored
           environment is a bright overhead strip and a big amber wrap, and
           a rough diffuse surface picks all of that up — which was lighting
           the figure's back almost as much as the screen was lighting its
           front, so it stopped being backlit at all. The room still gets
           the full environment; the body only gets a quarter of it. */
        envMapIntensity: theme === "light" ? 0.9 : 0.14,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: p.metal,
        roughness: 0.45,
        metalness: theme === "light" ? 0.35 : 0.65,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  /* Keycaps and paper are the two things in the room allowed to be lighter
     than everything else — they are what the screen light lands on. */
  const cap = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme === "light" ? "#2b2b31" : "#17171d",
        roughness: 0.7,
        metalness: 0.05,
      }),
    [theme],
  );

  const paper = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme === "light" ? "#e8e2d4" : "#2a2721",
        roughness: 0.95,
        metalness: 0,
      }),
    [theme],
  );

  /* ---------------------------------------------------------------- rig */
  const chest = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Breathing. Twelve thousandths of a unit — you should not be able to
    // point at it, only notice that the figure is not a statue.
    if (chest.current) {
      chest.current.scale.y = 1 + Math.sin(t * 1.15) * 0.014;
      chest.current.scale.z = 1 + Math.sin(t * 1.15) * 0.01;
    }

    if (head.current) {
      /* Every eleven seconds or so, a glance at the second screen and back.
         A triangular ramp rather than a sine: looking away is quick and
         looking back is quick, with a pause at each end. */
      const cycle = (t % 11) / 11;
      const glance =
        cycle < 0.06
          ? cycle / 0.06
          : cycle < 0.17
            ? 1
            : cycle < 0.24
              ? 1 - (cycle - 0.17) / 0.07
              : 0;
      head.current.rotation.y = -glance * 0.55;
      head.current.rotation.z = glance * 0.07;
      // And a small continuous nod, offset from the breath so they beat.
      head.current.rotation.x = Math.sin(t * 0.73) * 0.022 - glance * 0.06;
    }

    /* Typing: the forearms tick up and down out of phase, and stop for a
       couple of seconds now and then the way thinking does. */
    const working = Math.sin(t * 0.21) > -0.35 ? 1 : 0;
    const tick = (phase: number) =>
      working * Math.max(0, Math.sin(t * 9.5 + phase)) * 0.035;
    if (foreL.current) foreL.current.rotation.x = -tick(0);
    if (foreR.current) foreR.current.rotation.x = -tick(1.9);
  });

  return (
    <group>
      {/* ---------------------------------------------------------- figure.
          Seated left of centre on purpose: dead-centre puts their head
          squarely over the screen and the tagline never gets read. */}
      <group position={[-0.26, 0, 0]}>
        {/* Hips */}
        <Limb from={[-0.06, 0.33, 0.01]} to={[0.06, 0.33, 0.01]} radius={0.075} material={dark} />

        {/* Torso, leaning in toward the screen. Scaled by the breath. */}
        <group ref={chest} position={[0, 0.33, 0]}>
          <Limb from={[0, 0.0, -0.01]} to={[0, 0.27, 0.05]} radius={0.088} material={dark} />
          {/* Shoulders — the two spheres that turn a capsule into a body */}
          <mesh position={[-0.092, 0.238, 0.035]} material={dark}>
            <sphereGeometry args={[0.042, 16, 12]} />
          </mesh>
          <mesh position={[0.092, 0.238, 0.035]} material={dark}>
            <sphereGeometry args={[0.042, 16, 12]} />
          </mesh>
          {/* Neck */}
          <Limb from={[0, 0.27, 0.05]} to={[0, 0.325, 0.065]} radius={0.032} material={dark} />
        </group>

        {/* Head, on its own pivot so it can look around */}
        <group ref={head} position={[0, 0.66, 0.065]}>
          <mesh position={[0, 0.065, 0.01]} material={dark} scale={[1, 1.08, 1.02]}>
            <sphereGeometry args={[0.078, 24, 20]} />
          </mesh>
          {/* Hair: a slightly larger cap pushed back off the brow */}
          <mesh
            position={[0, 0.082, -0.008]}
            material={dark}
            scale={[1.04, 0.92, 1.04]}
          >
            <sphereGeometry args={[0.082, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
          {/* The ear-side of a headphone band, barely caught by the rim light */}
          <mesh position={[0, 0.1, -0.012]} rotation={[0.2, 0, 0]} material={metal}>
            <torusGeometry args={[0.079, 0.0055, 6, 20, Math.PI]} />
          </mesh>
        </group>

        {/* Arms. Upper arm fixed at the shoulder, forearm on its own pivot
            at the elbow so the typing motion is a rotation and not a
            rebuilt capsule every frame. */}
        <group position={[-0.105, 0.575, 0.04]}>
          <Limb from={[0, 0, 0]} to={[-0.045, -0.115, 0.13]} radius={0.034} material={dark} />
          <group ref={foreL} position={[-0.045, -0.115, 0.13]}>
            <Limb from={[0, 0, 0]} to={[0.05, -0.025, 0.2]} radius={0.029} material={dark} />
            <mesh position={[0.055, -0.03, 0.215]} material={dark}>
              <sphereGeometry args={[0.027, 12, 10]} />
            </mesh>
          </group>
        </group>
        <group position={[0.105, 0.575, 0.04]}>
          <Limb from={[0, 0, 0]} to={[0.045, -0.115, 0.13]} radius={0.034} material={dark} />
          <group ref={foreR} position={[0.045, -0.115, 0.13]}>
            <Limb from={[0, 0, 0]} to={[-0.025, -0.025, 0.21]} radius={0.029} material={dark} />
            <mesh position={[-0.03, -0.03, 0.225]} material={dark}>
              <sphereGeometry args={[0.027, 12, 10]} />
            </mesh>
          </group>
        </group>

        {/* Seated legs */}
        <Limb from={[-0.065, 0.33, 0.0]} to={[-0.085, 0.315, 0.27]} radius={0.047} material={dark} />
        <Limb from={[-0.085, 0.315, 0.27]} to={[-0.085, 0.055, 0.29]} radius={0.038} material={dark} />
        <Limb from={[-0.085, 0.055, 0.29]} to={[-0.085, 0.022, 0.35]} radius={0.03} material={dark} />
        <Limb from={[0.065, 0.33, 0.0]} to={[0.085, 0.315, 0.27]} radius={0.047} material={dark} />
        <Limb from={[0.085, 0.315, 0.27]} to={[0.085, 0.055, 0.29]} radius={0.038} material={dark} />
        <Limb from={[0.085, 0.055, 0.29]} to={[0.085, 0.022, 0.35]} radius={0.03} material={dark} />
      </group>

      {/* ----------------------------------------------------------- chair */}
      <group position={[-0.26, 0, 0]}>
        <mesh position={[0, 0.3, 0.02]} material={dark}>
          <boxGeometry args={[0.33, 0.035, 0.31]} />
        </mesh>
        {/*
          Backrest. This was a full-height slab and it was the single worst
          thing in the scene: from a camera sitting behind the figure it
          covered the entire body, so the shot read as a black monolith with
          a head balanced on it. A real task chair tops out at the shoulder
          blades and is narrower than the shoulders, which is exactly what
          lets the torso, the arms and the head stay legible from behind.
        */}
        <group position={[0, 0.455, -0.145]} rotation={[0.17, 0, 0]}>
          <mesh material={dark}>
            <boxGeometry args={[0.235, 0.2, 0.024]} />
          </mesh>
          {/* A frame around it, in the lighter metal. Without this the back
              is an unbroken black rectangle and reads as a hole in the
              picture rather than as a piece of furniture. */}
          {[
            { p: [0, 0.103, 0.004] as const, s: [0.247, 0.01, 0.03] as const },
            { p: [0, -0.103, 0.004] as const, s: [0.247, 0.01, 0.03] as const },
            { p: [-0.119, 0, 0.004] as const, s: [0.01, 0.216, 0.03] as const },
            { p: [0.119, 0, 0.004] as const, s: [0.01, 0.216, 0.03] as const },
          ].map((b, i) => (
            <mesh key={i} position={b.p} material={metal}>
              <boxGeometry args={b.s} />
            </mesh>
          ))}
        </group>
        {/* Lumbar bar, with a gap between it and the backrest */}
        <mesh position={[0, 0.345, -0.115]} rotation={[0.17, 0, 0]} material={dark}>
          <boxGeometry args={[0.2, 0.038, 0.02]} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-0.19, 0.385, 0.05]} material={dark}>
          <boxGeometry args={[0.028, 0.014, 0.15]} />
        </mesh>
        <mesh position={[0.19, 0.385, 0.05]} material={dark}>
          <boxGeometry args={[0.028, 0.014, 0.15]} />
        </mesh>
        <Limb from={[-0.17, 0.3, 0.03]} to={[-0.19, 0.38, 0.03]} radius={0.008} material={metal} />
        <Limb from={[0.17, 0.3, 0.03]} to={[0.19, 0.38, 0.03]} radius={0.008} material={metal} />
        {/* Gas strut and a five-star base */}
        <Limb from={[0, 0.3, 0.02]} to={[0, 0.07, 0.02]} radius={0.019} material={metal} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 + 0.3;
          const x = Math.cos(a) * 0.16;
          const z = Math.sin(a) * 0.16 + 0.02;
          return (
            <group key={i}>
              <Limb from={[0, 0.065, 0.02]} to={[x, 0.035, z]} radius={0.009} material={metal} />
              <mesh position={[x, 0.022, z]} material={dark}>
                <sphereGeometry args={[0.021, 10, 8]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ------------------------------------------------------------ desk */}
      <group>
        <mesh position={[0, 0.425, 0.44]} material={dark}>
          <boxGeometry args={[1.25, 0.028, 0.56]} />
        </mesh>
        {/* A warm hairline along the front edge — catches the screen light */}
        <mesh position={[0, 0.413, 0.716]}>
          <boxGeometry args={[1.25, 0.004, 0.004]} />
          <meshBasicMaterial
            color={p.amber}
            toneMapped={false}
            transparent
            opacity={theme === "light" ? 0.75 : 0.5}
          />
        </mesh>
        <Limb from={[-0.57, 0.41, 0.22]} to={[-0.57, 0, 0.22]} radius={0.014} material={metal} />
        <Limb from={[0.57, 0.41, 0.22]} to={[0.57, 0, 0.22]} radius={0.014} material={metal} />
        <Limb from={[-0.57, 0.41, 0.66]} to={[-0.57, 0, 0.66]} radius={0.014} material={metal} />
        <Limb from={[0.57, 0.41, 0.66]} to={[0.57, 0, 0.66]} radius={0.014} material={metal} />
        {/* A cross-brace, because a desk this thin would wobble */}
        <Limb from={[-0.57, 0.1, 0.22]} to={[0.57, 0.1, 0.22]} radius={0.008} material={metal} />
      </group>

      {/* ------------------------------------------------------------ props */}
      {/* Keyboard, under the hands */}
      <group position={[-0.21, 0.441, 0.6]} rotation={[0, 0.06, 0]}>
        <mesh material={dark}>
          <boxGeometry args={[0.24, 0.008, 0.085]} />
        </mesh>
        <group position={[0, 0.006, 0]}>
          <Keycaps material={cap} />
        </group>
      </group>

      {/* Trackpad */}
      <mesh position={[-0.05, 0.441, 0.615]} rotation={[0, 0.06, 0]} material={cap}>
        <boxGeometry args={[0.055, 0.005, 0.042]} />
      </mesh>

      {/* Mug, still going */}
      <group position={[0.3, 0.44, 0.59]}>
        <mesh position={[0, 0.032, 0]} material={dark}>
          <cylinderGeometry args={[0.027, 0.023, 0.062, 18, 1, true]} />
        </mesh>
        <mesh position={[0, 0.058, 0]}>
          <circleGeometry args={[0.026, 18]} />
          <meshBasicMaterial
            color={theme === "light" ? "#4a2a12" : "#1d1007"}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.032, 0.035, 0]} rotation={[0, 0, Math.PI / 2]} material={dark}>
          <torusGeometry args={[0.016, 0.004, 6, 14]} />
        </mesh>
        <group position={[0, 0.066, 0]}>
          <Steam theme={theme} />
        </group>
      </group>

      {/* Notebook, open, with a pen across it */}
      <group position={[0.1, 0.441, 0.28]} rotation={[0, -0.22, 0]}>
        <mesh material={paper}>
          <boxGeometry args={[0.15, 0.004, 0.105]} />
        </mesh>
        <mesh position={[0, 0.003, 0]} material={metal}>
          <boxGeometry args={[0.004, 0.002, 0.1]} />
        </mesh>
        <mesh position={[0.02, 0.009, 0.01]} rotation={[0, 0.5, 0.04]} material={metal}>
          <capsuleGeometry args={[0.0035, 0.085, 4, 8]} />
        </mesh>
      </group>

      {/* A short stack of printed paper, fanned */}
      <group position={[-0.47, 0.441, 0.33]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[i * 0.004, i * 0.0022, i * 0.003]}
            rotation={[0, 0.1 + i * 0.05, 0]}
            material={paper}
          >
            <boxGeometry args={[0.13, 0.0018, 0.095]} />
          </mesh>
        ))}
      </group>

      {/* Phone, face down. Nobody deep in it keeps it face up. */}
      <mesh position={[0.46, 0.443, 0.34]} rotation={[0, 0.34, 0]} material={dark}>
        <boxGeometry args={[0.038, 0.008, 0.078]} />
      </mesh>

      {/* --------------------------------------------------------- monitor */}
      <group position={[0.08, 0, 0.6]}>
        {/* Stand */}
        <Limb from={[0, 0.44, 0]} to={[0, 0.56, -0.02]} radius={0.016} material={metal} />
        <mesh position={[0, 0.445, 0]} material={metal}>
          <boxGeometry args={[0.18, 0.012, 0.1]} />
        </mesh>
        {/* Shell */}
        <mesh position={[0, 0.74, -0.025]} rotation={[-0.06, 0, 0]} material={dark}>
          <boxGeometry args={[0.92, 0.5, 0.022]} />
        </mesh>
        {/* A bezel in front of the panel. Four thin bars rather than a
            bigger box behind it: the lip is what makes a slab of lit pixels
            read as a machine. */}
        <group position={[0, 0.74, -0.048]} rotation={[-0.06, 0, 0]}>
          {[
            { pos: [0, 0.243, 0] as const, size: [0.92, 0.014, 0.012] as const },
            { pos: [0, -0.243, 0] as const, size: [0.92, 0.014, 0.012] as const },
            { pos: [-0.453, 0, 0] as const, size: [0.014, 0.5, 0.012] as const },
            { pos: [0.453, 0, 0] as const, size: [0.014, 0.5, 0.012] as const },
          ].map((b, i) => (
            <mesh key={i} position={b.pos} material={metal}>
              <boxGeometry args={b.size} />
            </mesh>
          ))}
        </group>
        {/* The screen. It faces -Z, which — once the whole diorama is turned
            to put the camera behind the figure — is the side pointed at the
            viewer. So the tagline is readable and the figure is a silhouette
            against it, both at once. */}
        {/*
          The screen sits parallel to the shell, which it was not.

          Three.js applies Euler angles in XYZ order, so the Y flip that
          turns the panel to face the viewer happens *before* the X tilt —
          which means a shell raked by -0.06 and a screen raked by +0.06 end
          up 0.12 radians apart, not parallel. Over half a metre of panel
          that is enough for the shell to rise in front of the top of the
          screen and cut off everything above the middle of it. The sign has
          to flip with the Y rotation.
        */}
        <group position={[0, 0.74, -0.042]} rotation={[-0.06, Math.PI, 0]}>
          <ScreenPanel width={0.88} height={0.465} theme={theme} />
        </group>
        {/* Bloom off the panel, and the light it throws into the room */}
        {/* Bloom in front of the panel. Kept low: at half intensity this
            washed straight over the tagline and the panel read as one flat
            orange rectangle with a caret floating in it. */}
        <Glow
          theme={theme}
          size={1.55}
          intensity={0.2}
          position={[0, 0.74, -0.08]}
          rotation={[-0.06, Math.PI, 0]}
        />
        {/* The shaft of light over the desk. Also kept very low — a cone is
            a solid, and at any real opacity the viewer sees its silhouette
            and reads a translucent triangle instead of lit air. */}
        <LightCone
          theme={theme}
          radius={0.5}
          height={1.0}
          color={p.screen}
          opacity={0.075}
          position={[-0.16, 0.66, 0.04]}
          rotation={[0, 0, Math.PI / 2 - 0.12]}
        />
        {/* Cable off the back, sagging to the floor */}
        <Cable
          points={[
            [0.1, 0.52, -0.02],
            [0.17, 0.33, -0.09],
            [0.2, 0.12, -0.04],
            [0.16, 0.01, 0.06],
          ]}
          material={metal}
        />
      </group>

      {/* A second, smaller screen off to the side — the engineer's second pane */}
      <group position={[0.74, 0, 0.5]} rotation={[0, -0.5, 0]}>
        <Limb from={[0, 0.44, 0]} to={[0, 0.53, 0]} radius={0.013} material={metal} />
        <mesh position={[0, 0.445, 0]} material={metal}>
          <boxGeometry args={[0.1, 0.01, 0.07]} />
        </mesh>
        <mesh position={[0, 0.66, -0.016]} rotation={[-0.05, 0, 0]} material={dark}>
          <boxGeometry args={[0.34, 0.26, 0.02]} />
        </mesh>
        <group position={[0, 0.66, -0.032]} rotation={[-0.05, Math.PI, 0]}>
          <ScrollingCode theme={theme} width={0.31} height={0.23} />
        </group>
        <Cable
          points={[
            [0.0, 0.44, -0.03],
            [0.05, 0.26, -0.1],
            [0.02, 0.08, -0.03],
            [-0.04, 0.01, 0.05],
          ]}
          material={metal}
        />
      </group>

      {/* Desk lamp — a warm accent, off to the left */}
      <group position={[-0.5, 0, 0.3]}>
        <mesh position={[0, 0.445, 0]} material={metal}>
          <cylinderGeometry args={[0.045, 0.05, 0.012, 16]} />
        </mesh>
        <Limb from={[0, 0.45, 0]} to={[-0.05, 0.7, 0.04]} radius={0.008} material={metal} />
        {/* Shade: open-ended cone, tipped down at the desk. Double-sided so
            the inside of it catches the bulb — a shade you can only see the
            outside of is just a dark cap. */}
        <mesh position={[-0.06, 0.715, 0.07]} rotation={[1.05, 0, 0.12]}>
          <coneGeometry args={[0.078, 0.095, 20, 1, true]} />
          <meshStandardMaterial
            color={p.metal}
            roughness={0.5}
            metalness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-0.064, 0.7, 0.085]}>
          <sphereGeometry args={[0.014, 12, 12]} />
          <meshBasicMaterial color={p.screen} toneMapped={false} />
        </mesh>
        {/* No cone on the lamp. Two visible cones in one frame is two
            visible triangles; the bulb gets a bloom instead. */}
        <Glow
          theme={theme}
          size={0.34}
          intensity={0.5}
          position={[-0.05, 0.713, 0.09]}
        />
      </group>
    </group>
  );
}
