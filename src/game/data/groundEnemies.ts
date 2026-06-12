import type { GroundEnemyTypeId } from '../types';

export interface GroundEnemyDefinition {
  id: GroundEnemyTypeId;
  name: string;
  health: number;
  speed: number;
  radius: number;
  score: number;
  breachRate: number;
  breachBurst: number;
  attackDamage: number;
  attackInterval: number;
  attackRange: number;
  color: string;
  accentColor: string;
  shakeOnDeath: number;
  minLevel: number;
}

export const GROUND_ENEMY_DEFINITIONS: Record<GroundEnemyTypeId, GroundEnemyDefinition> = {
  crawler: {
    id: 'crawler',
    name: 'Alien Crawler',
    health: 28,
    speed: 48,
    radius: 14,
    score: 80,
    breachRate: 10,
    breachBurst: 0,
    attackDamage: 0,
    attackInterval: 0,
    attackRange: 0,
    color: '#2d6a4f',
    accentColor: '#95d5b2',
    shakeOnDeath: 2,
    minLevel: 1,
  },
  spitter: {
    id: 'spitter',
    name: 'Spitter Alien',
    health: 22,
    speed: 58,
    radius: 12,
    score: 120,
    breachRate: 4,
    breachBurst: 0,
    attackDamage: 6,
    attackInterval: 2.2,
    attackRange: 120,
    color: '#7b2cbf',
    accentColor: '#e0aaff',
    shakeOnDeath: 2.5,
    minLevel: 1,
  },
  leaper: {
    id: 'leaper',
    name: 'Leaper Creature',
    health: 18,
    speed: 95,
    radius: 11,
    score: 150,
    breachRate: 6,
    breachBurst: 15,
    attackDamage: 0,
    attackInterval: 0,
    attackRange: 0,
    color: '#e85d04',
    accentColor: '#ffba08',
    shakeOnDeath: 3,
    minLevel: 1,
  },
  brood_guard: {
    id: 'brood_guard',
    name: 'Brood Guard',
    health: 52,
    speed: 36,
    radius: 17,
    score: 210,
    breachRate: 12,
    breachBurst: 0,
    attackDamage: 0,
    attackInterval: 0,
    attackRange: 0,
    color: '#5c4d3c',
    accentColor: '#d4a373',
    shakeOnDeath: 3.5,
    minLevel: 2,
  },
};

interface PayloadWeight {
  type: GroundEnemyTypeId;
  weight: number;
  minLevel: number;
}

const POD_PAYLOAD_WEIGHTS: PayloadWeight[] = [
  { type: 'crawler', weight: 50, minLevel: 1 },
  { type: 'leaper', weight: 28, minLevel: 1 },
  { type: 'spitter', weight: 18, minLevel: 1 },
  { type: 'brood_guard', weight: 22, minLevel: 2 },
];

export function pickPodPayload(levelId = 1): GroundEnemyTypeId {
  const pool = POD_PAYLOAD_WEIGHTS.filter((entry) => entry.minLevel <= levelId);
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return 'crawler';
}
