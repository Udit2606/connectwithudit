"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { palette, type SceneTheme } from "./palette";

/**
 * What he's thinking about, drawn above his head.
 *
 * Two registers, deliberately: a graph and some solids. The graph is the
 * literal content of the thought — nodes, edges, a signal travelling between
 * them, which is what someone who builds systems is actually picturing. The
 * wireframe solids above it are the part that has not resolved into a system
 * yet, cooling and fading the further ahead they are.
 *
 * It stays abstract on purpose. A literal thought bubble would be a cartoon;
 * an architecture diagram drifting out of a lit desk reads as imagination.
 */

/** Deterministic, so the figure is thinking the same thing every load. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Graph = {
  nodes: THREE.Vector3[];
  /** Index pairs. */
  edges: [number, number][];
};

/**
 * A loose lattice in a cone above the head: wider and sparser as it rises,
 * every node joined to its nearest few neighbours so the result reads as a
 * topology rather than as scattered dots.
 */
function buildGraph(): Graph {
  const rand = seeded(20260704);
  const nodes: THREE.Vector3[] = [];
  const COUNT = 15;

  for (let i = 0; i < COUNT; i++) {
    const t = i / (COUNT - 1);
    // Golden-angle spiral, so no two nodes stack up in projection.
    const a = i * 2.39996;
    const spread = 0.16 + t * 0.42;
    nodes.push(
      new THREE.Vector3(
        Math.cos(a) * spread * (0.6 + rand() * 0.7),
        // Compressed on purpose: taller than this and the top of the graph
        // climbs out of the frame and crowds the navigation.
        1.04 + t * 0.6 + (rand() - 0.5) * 0.06,
        Math.sin(a) * spread * (0.5 + rand() * 0.6),
      ),
    );
  }

  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: n.distanceTo(m) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([i, j]);
    });
  });

  return { nodes, edges };
}

/** The graph: nodes as soft points, edges with a signal running along them. */
function Constellation({
  theme,
  progress,
}: {
  theme: SceneTheme;
  progress: React.RefObject<number>;
}) {
  const p = palette(theme);
  const group = useRef<THREE.Group>(null);
  const nodeMat = useRef<THREE.ShaderMaterial>(null);
  const edgeMat = useRef<THREE.ShaderMaterial>(null);

  const graph = useMemo(buildGraph, []);

  const nodeGeometry = useMemo(() => {
    const pos = new Float32Array(graph.nodes.length * 3);
    const seed = new Float32Array(graph.nodes.length);
    graph.nodes.forEach((n, i) => {
      pos[i * 3] = n.x;
      pos[i * 3 + 1] = n.y;
      pos[i * 3 + 2] = n.z;
      seed[i] = (i * 0.137) % 1;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return geo;
  }, [graph]);

  const edgeGeometry = useMemo(() => {
    const n = graph.edges.length * 2;
    const pos = new Float32Array(n * 3);
    /** 0 at one end of the segment, 1 at the other. */
    const along = new Float32Array(n);
    /** Per-edge offset, so the signals do not all leave at once. */
    const seed = new Float32Array(n);
    graph.edges.forEach(([a, b], e) => {
      const s = (e * 0.173) % 1;
      [a, b].forEach((idx, k) => {
        const v = graph.nodes[idx];
        const o = (e * 2 + k) * 3;
        pos[o] = v.x;
        pos[o + 1] = v.y;
        pos[o + 2] = v.z;
        along[e * 2 + k] = k;
        seed[e * 2 + k] = s;
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return geo;
  }, [graph]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFade: { value: 1 },
      uRise: { value: 0 },
      uWarm: { value: new THREE.Color(p.amber) },
      uCool: { value: new THREE.Color(p.cool) },
      uInk: { value: p.ink },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const edgeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFade: { value: 1 },
      uRise: { value: 0 },
      uLine: { value: new THREE.Color(p.amber) },
      uInk: { value: p.ink },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const pr = progress.current ?? 0;

    if (group.current) {
      // One slow revolution every two minutes or so, and a shallow sway.
      group.current.rotation.y += dt * 0.055;
      group.current.rotation.z = Math.sin(t * 0.17) * 0.035;
      group.current.position.y = pr * 1.2 + Math.sin(t * 0.3) * 0.02;
    }

    [nodeMat, edgeMat].forEach((m) => {
      const u = m.current?.uniforms;
      if (!u) return;
      u.uTime.value = t;
      u.uFade.value = Math.max(0, 1 - pr * 1.1);
    });
  });

  const blending =
    theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={edgeMat}
          uniforms={edgeUniforms}
          transparent
          depthWrite={false}
          blending={blending}
          vertexShader={/* glsl */ `
            attribute float aAlong;
            attribute float aSeed;
            varying float vAlong;
            varying float vSeed;
            void main() {
              vAlong = aAlong;
              vSeed = aSeed;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uTime;
            uniform float uFade;
            uniform float uInk;
            uniform vec3 uLine;
            varying float vAlong;
            varying float vSeed;

            void main() {
              // A packet runs end to end, then the edge goes quiet again.
              float head = fract(uTime * 0.21 + vSeed);
              float d = abs(vAlong - head);
              float pulse = exp(-d * d * 90.0);
              float a = (0.11 + pulse * 0.72) * uFade * uInk;
              if (a < 0.004) discard;
              gl_FragColor = vec4(uLine, a);
            }
          `}
        />
      </lineSegments>

      <points geometry={nodeGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={nodeMat}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={blending}
          vertexShader={/* glsl */ `
            attribute float aSeed;
            uniform float uTime;
            varying float vSeed;
            void main() {
              vSeed = aSeed;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              float breathe = 0.85 + sin(uTime * 0.9 + aSeed * 11.0) * 0.15;
              gl_PointSize = (2.2 + aSeed * 1.6) * breathe * (34.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uFade;
            uniform float uInk;
            uniform vec3 uWarm;
            uniform vec3 uCool;
            varying float vSeed;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float a = pow(smoothstep(0.5, 0.05, d), 1.6) * uFade * uInk;
              if (a < 0.005) discard;
              // Higher-seeded nodes cool off — the further out the thought.
              gl_FragColor = vec4(mix(uWarm, uCool, vSeed), a);
            }
          `}
        />
      </points>
    </group>
  );
}

/*
 * All on the same side, and that side is the empty half of the frame.
 *
 * The diorama is turned roughly 150 degrees, so local +X projects to screen
 * *left* — which is the column the wordmark and the metadata rail own. Spread
 * evenly around the figure these drifted straight across the type. Negative X
 * puts them over the right third, where there is nothing else.
 */
const SHAPES: {
  kind: "ico" | "torus" | "octa" | "box";
  position: [number, number, number];
  scale: number;
  spin: number;
}[] = [
  { kind: "ico", position: [-0.28, 1.24, 0.12], scale: 0.07, spin: 0.22 },
  { kind: "torus", position: [-0.62, 1.4, -0.06], scale: 0.058, spin: -0.17 },
  { kind: "octa", position: [-0.42, 1.6, 0.14], scale: 0.055, spin: -0.26 },
];

function Geometry({ kind }: { kind: (typeof SHAPES)[number]["kind"] }) {
  switch (kind) {
    case "ico":
      return <icosahedronGeometry args={[1, 0]} />;
    case "torus":
      return <torusGeometry args={[0.8, 0.26, 8, 20]} />;
    case "octa":
      return <octahedronGeometry args={[1, 0]} />;
    case "box":
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
  }
}

function Solids({
  theme,
  progress,
}: {
  theme: SceneTheme;
  progress: React.RefObject<number>;
}) {
  const p = palette(theme);
  const group = useRef<THREE.Group>(null);

  // Higher shapes are cooler and fainter: the further ahead, the less certain.
  const materials = useMemo(
    () =>
      SHAPES.map((s) => {
        const t = Math.min(Math.max((s.position[1] - 1.24) / 0.4, 0), 1);
        const color = new THREE.Color(p.amber).lerp(new THREE.Color(p.cool), t);
        return new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: (0.5 - t * 0.26) * p.ink,
          toneMapped: false,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const time = clock.elapsedTime;
    const pr = progress.current ?? 0;

    group.current.children.forEach((child, i) => {
      const s = SHAPES[i];
      child.rotation.y += dt * s.spin;
      child.rotation.x += dt * s.spin * 0.6;
      // Each drifts on its own slow bob, and the whole set lifts on scroll.
      child.position.y = s.position[1] + Math.sin(time * 0.5 + i) * 0.05 + pr * 1.25;
      child.position.x = s.position[0] + Math.cos(time * 0.36 + i * 1.7) * 0.04;
    });
  });

  return (
    <group ref={group}>
      {SHAPES.map((s, i) => (
        <mesh key={i} position={s.position} scale={s.scale} material={materials[i]}>
          <Geometry kind={s.kind} />
        </mesh>
      ))}
    </group>
  );
}

/** Motes lifting off the desk and dispersing into the dark. */
function Motes({
  theme,
  progress,
  count = 110,
}: {
  theme: SceneTheme;
  progress: React.RefObject<number>;
  count?: number;
}) {
  const p = palette(theme);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const position = new Float32Array(count * 3);
    const aSeed = new Float32Array(count);
    const aSpeed = new Float32Array(count);
    const aSize = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Born above the monitor, not across it: starting at desk height sent
      // the plume straight over the panel and washed out the tagline.
      position[i * 3] = (Math.random() - 0.5) * 1.0;
      position[i * 3 + 1] = 1.02 + Math.random() * 0.18;
      position[i * 3 + 2] = 0.15 + (Math.random() - 0.5) * 0.45;
      aSeed[i] = Math.random();
      aSpeed[i] = 0.06 + Math.random() * 0.1;
      aSize[i] = 0.7 + Math.random() * 1.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(aSpeed, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 5);
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFade: { value: 1 },
      uRise: { value: 0 },
      uWarm: { value: new THREE.Color(p.mote) },
      uCool: { value: new THREE.Color(p.cool) },
      uInk: { value: p.ink },
      /* On paper these are marks, not glints. A mote that reads as a soft
         bloom on black reads as a thumbprint on white, so they shrink as
         well as dim. */
      uScale: { value: theme === "light" ? 0.5 : 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useFrame((_, dt) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    const pr = progress.current ?? 0;
    u.uRise.value = pr * 1.4;
    u.uFade.value = Math.max(0, 1 - pr * 1.25);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={
          theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending
        }
        vertexShader={/* glsl */ `
          attribute float aSeed;
          attribute float aSpeed;
          attribute float aSize;
          uniform float uTime;
          uniform float uRise;
          uniform float uScale;
          varying float vLife;

          void main() {
            // Each mote loops its own climb of ~2.2 units.
            float life = fract(aSeed + uTime * aSpeed);
            vLife = life;

            vec3 pos = position;
            pos.y += life * 1.5 + uRise;
            // Drift outward as they rise, so the plume opens up.
            pos.x += sin(uTime * 0.4 + aSeed * 12.0) * life * 0.3;
            pos.z += cos(uTime * 0.33 + aSeed * 9.0) * life * 0.22;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * uScale * (34.0 / -mv.z) * (1.0 - life * 0.35);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uFade;
          uniform float uInk;
          uniform vec3 uWarm;
          uniform vec3 uCool;
          varying float vLife;

          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = pow(smoothstep(0.5, 0.0, d), 1.9);
            // Fade in off the desk, out into the dark above.
            a *= smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
            a *= uFade * 0.95 * uInk;
            if (a < 0.005) discard;
            gl_FragColor = vec4(mix(uWarm, uCool, vLife * 0.8), a);
          }
        `}
      />
    </points>
  );
}

export function Dreams({
  theme,
  progress,
  quality,
}: {
  theme: SceneTheme;
  progress: React.RefObject<number>;
  quality: "mid" | "high";
}) {
  return (
    <group>
      <Constellation theme={theme} progress={progress} />
      <Solids theme={theme} progress={progress} />
      <Motes
        theme={theme}
        progress={progress}
        count={quality === "high" ? 130 : 70}
      />
    </group>
  );
}
