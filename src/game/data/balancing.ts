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

  /** Combat tuning */
  combat: {
    splashDamageFalloff: 0.55,
    splashDeathShakeScale: 0.6,
    splashExplosionScale: 0.65,
    minDropInterval: 0.8,
    bombKillShake: 3,
    podKillShake: 2,
  },

  /** Screen shake & feedback */
  effects: {
    shakeDecay: 9,
    maxShake: 14,
    heavyHitHealthThreshold: 48,
    heavyHitShake: 1.8,
    gameOverShake: 10,
    waveClearShake: 3,
    missileSplashShake: 6,
    flakSplashShake: 3,
    fireShake: {
      bullet: 1.5,
      laser: 2,
      flak: 3,
      missile: 5,
      plasma: 1.5,
    } as Record<string, number>,
  },

  /** Canvas announcement popup Y positions (fraction of canvas height) */
  ui: {
    popupY: {
      waveStart: 0.28,
      waveClearScore: 0.35,
      waveClearCredits: 0.41,
      levelClear: 0.32,
      bossEngage: 0.3,
      bossDownScore: 0.38,
      bossDownCredits: 0.44,
    },
    bossEngageFlashColor: '#ff4466',
    bossEngageFlashDuration: 0.22,
    shopToastDuration: { purchase: 2.2, equip: 1.8 },
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
