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
  },

  /** Turret placement offset from bottom */
  turret: {
    offsetY: 60,
  },

  /** Economy defaults (used in later phases) */
  economy: {
    startingCredits: 0,
    killCreditMultiplier: 1,
    waveClearBonus: 50,
    levelCompleteBonus: 200,
    bossKillBonus: 500,
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
    loopFromWave: 4,
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
} as const;
