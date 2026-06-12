import type { EnemyTypeId, MovementPattern } from '../types';

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
  },
};

export const ENEMY_TYPE_LIST = Object.keys(ENEMY_DEFINITIONS) as EnemyTypeId[];
