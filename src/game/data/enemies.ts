import type { EnemyTypeId, GroundEnemyTypeId, MovementPattern } from '../types';

export type DropKind = 'none' | 'pod' | 'bomb';

export interface EnemyDefinition {
  id: EnemyTypeId;
  name: string;
  health: number;
  speed: number;
  radius: number;
  score: number;
  pattern: MovementPattern;
  patternAmplitude: number;
  patternFrequency: number;
  color: string;
  accentColor: string;
  glowColor: string;
  shakeOnDeath: number;
  dropKind: DropKind;
  dropInterval: number;
  maxDrops: number;
  /** Front shield HP — must break before hull damage (shielded types) */
  shieldHealth?: number;
  /** Fixed ground payload for pod drops */
  podPayload?: GroundEnemyTypeId;
  /** Earliest campaign level this type appears in wave blueprints */
  minLevel: number;
}

export const ENEMY_DEFINITIONS: Record<EnemyTypeId, EnemyDefinition> = {
  scout_saucer: {
    id: 'scout_saucer',
    name: 'Scout Saucer',
    health: 18,
    speed: 200,
    radius: 14,
    score: 100,
    pattern: 'sine',
    patternAmplitude: 45,
    patternFrequency: 2.8,
    color: '#5b21b6',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    shakeOnDeath: 2,
    dropKind: 'none',
    dropInterval: 0,
    maxDrops: 0,
    minLevel: 1,
  },
  drop_carrier: {
    id: 'drop_carrier',
    name: 'Drop Carrier',
    health: 55,
    speed: 95,
    radius: 26,
    score: 250,
    pattern: 'bob',
    patternAmplitude: 22,
    patternFrequency: 1.6,
    color: '#1b4332',
    accentColor: '#52b788',
    glowColor: 'rgba(82, 183, 136, 0.45)',
    shakeOnDeath: 3.5,
    dropKind: 'pod',
    dropInterval: 2.6,
    maxDrops: 3,
    minLevel: 1,
  },
  bomber_ship: {
    id: 'bomber_ship',
    name: 'Bomber Ship',
    health: 90,
    speed: 70,
    radius: 30,
    score: 400,
    pattern: 'arc',
    patternAmplitude: 55,
    patternFrequency: 1.3,
    color: '#9d0208',
    accentColor: '#ff6b35',
    glowColor: 'rgba(255, 107, 53, 0.5)',
    shakeOnDeath: 5.5,
    dropKind: 'bomb',
    dropInterval: 3.0,
    maxDrops: 2,
    minLevel: 1,
  },
  shielded_transport: {
    id: 'shielded_transport',
    name: 'Shielded Transport',
    health: 72,
    speed: 58,
    radius: 32,
    score: 380,
    pattern: 'straight',
    patternAmplitude: 12,
    patternFrequency: 1.0,
    color: '#3d405b',
    accentColor: '#8d99ae',
    glowColor: 'rgba(141, 153, 174, 0.55)',
    shakeOnDeath: 4.5,
    dropKind: 'none',
    dropInterval: 0,
    maxDrops: 0,
    shieldHealth: 48,
    minLevel: 1,
  },
  drone_swarm_pod: {
    id: 'drone_swarm_pod',
    name: 'Drone Swarm Pod',
    health: 38,
    speed: 130,
    radius: 18,
    score: 220,
    pattern: 'sine',
    patternAmplitude: 35,
    patternFrequency: 3.2,
    color: '#4a1942',
    accentColor: '#e056fd',
    glowColor: 'rgba(224, 86, 253, 0.5)',
    shakeOnDeath: 3,
    dropKind: 'pod',
    dropInterval: 1.7,
    maxDrops: 5,
    minLevel: 2,
  },
  elite_bio_pod: {
    id: 'elite_bio_pod',
    name: 'Elite Bio-Pod',
    health: 68,
    speed: 78,
    radius: 28,
    score: 340,
    pattern: 'bob',
    patternAmplitude: 18,
    patternFrequency: 1.4,
    color: '#1a535c',
    accentColor: '#4ecdc4',
    glowColor: 'rgba(78, 205, 196, 0.5)',
    shakeOnDeath: 4,
    dropKind: 'pod',
    dropInterval: 2.8,
    maxDrops: 2,
    podPayload: 'brood_guard',
    minLevel: 3,
  },
};

export const ENEMY_TYPE_LIST = Object.keys(ENEMY_DEFINITIONS) as EnemyTypeId[];

export function getPodPayloadForEnemy(typeId: EnemyTypeId): GroundEnemyTypeId | null {
  return ENEMY_DEFINITIONS[typeId].podPayload ?? null;
}
