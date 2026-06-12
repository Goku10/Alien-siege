/**
 * Global balancing constants for Alien Siege: Turret Defense.
 * Tune gameplay feel and economy here.
 */

export const BALANCING = {
  /** Canvas logical resolution (scaled to fit viewport) */
  canvas: {
    width: 1280,
    height: 720,
  },

  /** Base structure */
  base: {
    maxHealth: 100,
    maxBreach: 100,
    width: 200,
    height: 80,
    offsetFromBottom: 8,
    bombDamage: 18,
    breachDangerThreshold: 0.7,
    /** Each ground unit can contribute at most maxBreach / this value */
    groundUnitsRequiredForFullBreach: 4,
  },

  /** Turret placement offset from bottom */
  turret: {
    offsetY: 60,
  },

  /** Session economy — credit payouts live in credits.ts */
  economy: {
    startingCredits: 0,
  },

  /** Combo system */
  combo: {
    decayTime: 2.8,
    maxMultiplier: 5,
    killsPerStep: 2,
  },

  /** Wave spawning */
  waves: {
    betweenWaveDelay: 2.5,
    startDelay: 1.0,
    skyYMin: 90,
    skyYMax: 300,
  },

  /** Level progression (Phase 4) */
  levels: {
    introDuration: 3.5,
    bossWarningDuration: 4.0,
    waveAnnounceDuration: 1.8,
  },

  /** Score values */
  scoring: {
    hitBonus: 0,
    waveClearMultiplier: 1,
  },

  /** Screen shake */
  effects: {
    shakeDecay: 8,
    maxShake: 12,
  },

  /** Falling threats */
  threats: {
    bombFallSpeed: 220,
    bombRadius: 10,
    bombHealth: 12,
    bombScore: 75,
    podFallSpeed: 160,
    podRadius: 14,
    podHealth: 20,
    podScore: 50,
    dropMinX: 180,
    dropMaxOffsetFromEdge: 180,
  },
} as const;
