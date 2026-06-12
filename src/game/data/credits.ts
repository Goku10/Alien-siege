import type { EnemyTypeId, GroundEnemyTypeId } from '../types';

/**
 * Spendable credits economy — tune all credit payouts here.
 * Score values live on enemy/wave/level definitions; credits are separate.
 */
export const CREDIT_REWARDS = {
  /** Flat credits per enemy/threat kill */
  kills: {
    scout_saucer: 8,
    drop_carrier: 18,
    bomber_ship: 32,
    shielded_transport: 28,
    drone_swarm_pod: 22,
    elite_bio_pod: 30,
    crawler: 10,
    spitter: 14,
    leaper: 20,
    brood_guard: 26,
    bomb: 12,
    pod: 8,
  },

  /** Wave clear: credits derived from wave clearBonus score value */
  waveClear: {
    creditsPerClearBonusPoint: 0.35,
    minimum: 18,
  },

  /** Flat payout when a level is cleared (by level id) */
  levelComplete: {
    1: 80,
    2: 120,
    3: 165,
  } as Record<number, number>,

  /** Boss mothership defeat bonus (by level id) */
  bossDefeat: {
    1: 140,
    2: 195,
    3: 260,
  } as Record<number, number>,

  /** Optional performance bonuses at level end */
  performance: {
    minShotsForAccuracy: 10,
    accuracyThreshold: 0.55,
    accuracyBonus: 45,
    lowBreachRatio: 0.25,
    lowBreachBonus: 30,
    flawlessBreachBonus: 55,
  },
} as const;

export type CreditKillId =
  | EnemyTypeId
  | GroundEnemyTypeId
  | 'bomb'
  | 'pod';

export function getKillCredits(target: CreditKillId): number {
  return CREDIT_REWARDS.kills[target];
}

export function getWaveClearCredits(clearBonus: number): number {
  const scaled = Math.floor(
    clearBonus * CREDIT_REWARDS.waveClear.creditsPerClearBonusPoint,
  );
  return Math.max(CREDIT_REWARDS.waveClear.minimum, scaled);
}

export function getLevelCompleteCredits(levelId: number): number {
  return CREDIT_REWARDS.levelComplete[levelId] ?? 100;
}

export function getBossDefeatCredits(levelId: number): number {
  return CREDIT_REWARDS.bossDefeat[levelId] ?? 150;
}
