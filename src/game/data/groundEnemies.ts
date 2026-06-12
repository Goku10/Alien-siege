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
  },
};

const POD_PAYLOAD_WEIGHTS: { type: GroundEnemyTypeId; weight: number }[] = [
  { type: 'crawler', weight: 55 },
  { type: 'leaper', weight: 30 },
  { type: 'spitter', weight: 15 },
];

export function pickPodPayload(): GroundEnemyTypeId {
  const total = POD_PAYLOAD_WEIGHTS.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  for (const entry of POD_PAYLOAD_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return 'crawler';
}
