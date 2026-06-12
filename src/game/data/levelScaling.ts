/**
 * Per-level difficulty scaling applied at spawn time.
 * Tune progression curve here.
 */

export interface LevelScaling {
  /** Multiplier on enemy horizontal speed */
  speedMultiplier: number;
  /** Multiplier on enemy max health (and shields) */
  healthMultiplier: number;
  /** Multiplier on wave spawn delays (< 1 = faster spawns) */
  spawnDelayScale: number;
  /** Multiplier on wave clear bonuses */
  clearBonusScale: number;
  /** Extra score per kill (flat multiplier on score value) */
  scoreMultiplier: number;
  /** Multiplier on drop carrier/pod release interval (< 1 = more drops) */
  dropIntervalScale: number;
  /** Flat bonus to max drops per dropping enemy */
  maxDropsBonus: number;
  /** Multiplier on ground unit speed after pods land */
  groundSpeedMultiplier: number;
  /** Multiplier on ground unit health from pods */
  groundHealthMultiplier: number;
}

export const LEVEL_SCALING: Record<number, LevelScaling> = {
  1: {
    speedMultiplier: 1.0,
    healthMultiplier: 1.0,
    spawnDelayScale: 1.0,
    clearBonusScale: 1.0,
    scoreMultiplier: 1.0,
    dropIntervalScale: 1.0,
    maxDropsBonus: 0,
    groundSpeedMultiplier: 1.0,
    groundHealthMultiplier: 1.0,
  },
  2: {
    speedMultiplier: 1.1,
    healthMultiplier: 1.15,
    spawnDelayScale: 0.88,
    clearBonusScale: 1.2,
    scoreMultiplier: 1.1,
    dropIntervalScale: 0.9,
    maxDropsBonus: 0,
    groundSpeedMultiplier: 1.08,
    groundHealthMultiplier: 1.1,
  },
  3: {
    speedMultiplier: 1.2,
    healthMultiplier: 1.28,
    spawnDelayScale: 0.78,
    clearBonusScale: 1.4,
    scoreMultiplier: 1.2,
    dropIntervalScale: 0.82,
    maxDropsBonus: 1,
    groundSpeedMultiplier: 1.15,
    groundHealthMultiplier: 1.2,
  },
};

export function getScalingForLevel(levelId: number): LevelScaling {
  return LEVEL_SCALING[levelId] ?? LEVEL_SCALING[3];
}
