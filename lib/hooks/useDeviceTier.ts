"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "unknown" | "low" | "mid" | "high";

export type DeviceProfile = {
  tier: DeviceTier;
  /** Fine pointer + hover — gates the custom cursor and hover-only affordances. */
  hasFinePointer: boolean;
  /** Whether the heavy 3D scene should mount at all. */
  allow3D: boolean;
  /** Device pixel ratio ceiling for the renderer. */
  dprCap: [number, number];
};

const INITIAL: DeviceProfile = {
  tier: "unknown",
  hasFinePointer: false,
  allow3D: false,
  dprCap: [1, 1.5],
};

/**
 * Capability detection, not device sniffing. We care about three things:
 * can it hover, how many cores does it have, and is the connection metered.
 */
export function useDeviceTier(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(INITIAL);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const narrow = window.innerWidth < 768;

    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    // `saveData` is an explicit user preference, so it is a hard block.
    const saveData = conn?.saveData === true;
    // `effectiveType` is only a bandwidth *estimate*, and an unreliable one —
    // it reports "slow-2g" against a localhost server. Treat it as a quality
    // hint rather than a veto, so a momentary dip never costs the hero.
    const slowNet = /(^|-)2g$/.test(conn?.effectiveType ?? "");

    // Does WebGL exist at all? If not, nothing downstream should try.
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl")
      );
    } catch {
      webgl = false;
    }

    let tier: DeviceTier = "mid";
    if (cores <= 4 || mem <= 2 || narrow) tier = "low";
    if (cores >= 8 && mem >= 8 && !narrow && !slowNet) tier = "high";

    const allow3D = webgl && !saveData && tier !== "low";

    setProfile({
      tier,
      hasFinePointer: finePointer,
      allow3D,
      dprCap: tier === "high" ? [1, 2] : [1, 1.5],
    });
  }, []);

  return profile;
}
