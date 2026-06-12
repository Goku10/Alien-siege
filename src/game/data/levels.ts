import type { EnemyTypeId, SpawnSide } from '../types';
import { buildWavesForLevel } from './waveCompositions';

export interface WaveSpawn {
  enemyType: EnemyTypeId;
  side: SpawnSide | 'random';
  delay: number;
  y?: number;
}

export interface WaveConfig {
  id: number;
  spawns: WaveSpawn[];
  clearBonus: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  introText: string;
  waves: WaveConfig[];
  levelCompleteBonus: number;
}

/** Level 1 — Perimeter Defense */
export const LEVEL_1: LevelConfig = {
  id: 1,
  name: 'Perimeter Defense',
  subtitle: 'Sector 7G — Outer Rim',
  introText:
    'Alien scouts detected on approach vectors. Hold the perimeter and intercept drops before they land.',
  levelCompleteBonus: 500,
  waves: buildWavesForLevel(1),
};

/** Level 2 — Sky Siege: swarms and shielded convoys */
export const LEVEL_2: LevelConfig = {
  id: 2,
  name: 'Sky Siege',
  subtitle: 'Sector 7G — Lower Atmosphere',
  introText:
    'Enemy drop frequency increasing. Swarm pods and shielded transports inbound — prioritize high-value targets.',
  levelCompleteBonus: 750,
  waves: buildWavesForLevel(2),
};

/** Level 3 — Final Stand: elite bio-pods and combined arms */
export const LEVEL_3: LevelConfig = {
  id: 3,
  name: 'Final Stand',
  subtitle: 'Sector 7G — Command Perimeter',
  introText:
    'Full invasion force engaged. Elite bio-pods deploy brood guards — strip shields and clear the sky before the mothership arrives.',
  levelCompleteBonus: 1000,
  waves: buildWavesForLevel(3),
};

export const LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3];

export function getLevelById(id: number): LevelConfig {
  return LEVELS.find((l) => l.id === id) ?? LEVEL_1;
}
