/**
 * Alien Mothership boss configuration.
 * Tune HP, phases, and attack timings here.
 */

export type BossAttackId = 'drones' | 'bombSpread' | 'beam' | 'shield';

export interface BossPhaseConfig {
  phase: 1 | 2 | 3;
  healthThreshold: number;
  attackInterval: number;
  attacks: BossAttackId[];
  droneCount: number;
  bombCount: number;
  beamDamage: number;
  shieldDuration: number;
}

export const MOTHERSHIP_BOSS = {
  id: 'mothership',
  name: 'Alien Mothership',
  bodyRadius: 88,
  bodyWidth: 200,
  bodyHeight: 70,
  enterY: 130,
  moveSpeed: 55,
  moveAmplitude: 220,
  weakPointRadius: 16,
  weakPointDamageMultiplier: 2.0,
  bodyDamageMultiplier: 0.35,
  defeatScore: 2000,
  shakeOnHit: 2,
  shakeOnDefeat: 14,

  baseHealthByLevel: {
    1: 900,
    2: 1100,
    3: 1400,
  } as Record<number, number>,

  weakPoints: [
    { id: 'core_left', offsetX: -52, offsetY: 8 },
    { id: 'core_right', offsetX: 52, offsetY: 8 },
  ],

  phases: [
    {
      phase: 1,
      healthThreshold: 0.67,
      attackInterval: 4.5,
      attacks: ['drones', 'bombSpread'] as BossAttackId[],
      droneCount: 2,
      bombCount: 3,
      beamDamage: 12,
      shieldDuration: 0,
    },
    {
      phase: 2,
      healthThreshold: 0.34,
      attackInterval: 3.5,
      attacks: ['drones', 'bombSpread', 'beam'] as BossAttackId[],
      droneCount: 3,
      bombCount: 4,
      beamDamage: 18,
      shieldDuration: 0,
    },
    {
      phase: 3,
      healthThreshold: 0,
      attackInterval: 2.8,
      attacks: ['drones', 'bombSpread', 'beam', 'shield'] as BossAttackId[],
      droneCount: 4,
      bombCount: 5,
      beamDamage: 22,
      shieldDuration: 4.5,
    },
  ] satisfies BossPhaseConfig[],
} as const;

export function getBossHealthForLevel(levelId: number): number {
  return MOTHERSHIP_BOSS.baseHealthByLevel[levelId] ?? 1000;
}

export function getPhaseConfig(phase: 1 | 2 | 3): BossPhaseConfig {
  return MOTHERSHIP_BOSS.phases[phase - 1];
}
