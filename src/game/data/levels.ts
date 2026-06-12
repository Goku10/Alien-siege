import type { EnemyTypeId, SpawnSide } from '../types';

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

const SKY_Y_MIN = 90;
const SKY_Y_MAX = 300;

function skyY(slot: number): number {
  const range = SKY_Y_MAX - SKY_Y_MIN;
  return SKY_Y_MIN + (range / 5) * slot;
}

/** Level 1 — Perimeter Defense: scouts and first carriers */
export const LEVEL_1: LevelConfig = {
  id: 1,
  name: 'Perimeter Defense',
  subtitle: 'Sector 7G — Outer Rim',
  introText: 'Alien scouts detected on approach vectors. Hold the perimeter and intercept drops before they land.',
  levelCompleteBonus: 500,
  waves: [
    {
      id: 1,
      clearBonus: 150,
      spawns: [
        { enemyType: 'scout_saucer', side: 'left', delay: 0.6, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.3, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'left', delay: 2.1, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.9, y: skyY(0) },
      ],
    },
    {
      id: 2,
      clearBonus: 200,
      spawns: [
        { enemyType: 'scout_saucer', side: 'left', delay: 0.5, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.0, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.9, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.6, y: skyY(4) },
      ],
    },
    {
      id: 3,
      clearBonus: 250,
      spawns: [
        { enemyType: 'drop_carrier', side: 'left', delay: 0.6, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.2, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'left', delay: 1.8, y: skyY(4) },
        { enemyType: 'drop_carrier', side: 'right', delay: 2.5, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.2, y: skyY(3) },
      ],
    },
    {
      id: 4,
      clearBonus: 300,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.7, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.3, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'left', delay: 2.0, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.8, y: skyY(0) },
      ],
    },
  ],
};

/** Level 2 — Sky Siege: heavier drops and bombers */
export const LEVEL_2: LevelConfig = {
  id: 2,
  name: 'Sky Siege',
  subtitle: 'Sector 7G — Lower Atmosphere',
  introText: 'Enemy drop frequency increasing. Bombers inbound — shoot down payloads before they reach the base.',
  levelCompleteBonus: 750,
  waves: [
    {
      id: 1,
      clearBonus: 200,
      spawns: [
        { enemyType: 'scout_saucer', side: 'left', delay: 0.4, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 0.8, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.4, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.0, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.6, y: skyY(4) },
      ],
    },
    {
      id: 2,
      clearBonus: 250,
      spawns: [
        { enemyType: 'drop_carrier', side: 'left', delay: 0.5, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 1.0, y: skyY(1) },
        { enemyType: 'bomber_ship', side: 'left', delay: 1.7, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.3, y: skyY(0) },
      ],
    },
    {
      id: 3,
      clearBonus: 300,
      spawns: [
        { enemyType: 'bomber_ship', side: 'right', delay: 0.5, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.0, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.5, y: skyY(4) },
        { enemyType: 'drop_carrier', side: 'random', delay: 2.1, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'left', delay: 2.7, y: skyY(3) },
      ],
    },
    {
      id: 4,
      clearBonus: 350,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.4, y: skyY(1) },
        { enemyType: 'bomber_ship', side: 'right', delay: 0.9, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.5, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 2.0, y: skyY(0) },
      ],
    },
    {
      id: 5,
      clearBonus: 400,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.3, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 0.7, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'left', delay: 1.1, y: skyY(4) },
        { enemyType: 'bomber_ship', side: 'random', delay: 1.6, y: skyY(0) },
        { enemyType: 'drop_carrier', side: 'random', delay: 2.2, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.8, y: skyY(1) },
      ],
    },
  ],
};

/** Level 3 — Final Stand: maximum assault before mothership */
export const LEVEL_3: LevelConfig = {
  id: 3,
  name: 'Final Stand',
  subtitle: 'Sector 7G — Command Perimeter',
  introText: 'Full invasion force engaged. This is the last line before the mothership arrives. Do not let anything through.',
  levelCompleteBonus: 1000,
  waves: [
    {
      id: 1,
      clearBonus: 250,
      spawns: [
        { enemyType: 'drop_carrier', side: 'left', delay: 0.4, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'right', delay: 0.8, y: skyY(2) },
        { enemyType: 'bomber_ship', side: 'left', delay: 1.3, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'random', delay: 1.8, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.3, y: skyY(4) },
      ],
    },
    {
      id: 2,
      clearBonus: 300,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.3, y: skyY(2) },
        { enemyType: 'bomber_ship', side: 'right', delay: 0.7, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.2, y: skyY(4) },
        { enemyType: 'drop_carrier', side: 'right', delay: 1.6, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.1, y: skyY(3) },
      ],
    },
    {
      id: 3,
      clearBonus: 350,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.3, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'right', delay: 0.6, y: skyY(2) },
        { enemyType: 'bomber_ship', side: 'right', delay: 1.0, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.4, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 1.9, y: skyY(4) },
        { enemyType: 'bomber_ship', side: 'random', delay: 2.4, y: skyY(1) },
      ],
    },
    {
      id: 4,
      clearBonus: 400,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.25, y: skyY(2) },
        { enemyType: 'bomber_ship', side: 'right', delay: 0.55, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'left', delay: 0.9, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'right', delay: 1.25, y: skyY(0) },
        { enemyType: 'bomber_ship', side: 'random', delay: 1.7, y: skyY(4) },
      ],
    },
    {
      id: 5,
      clearBonus: 500,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.2, y: skyY(1) },
        { enemyType: 'bomber_ship', side: 'right', delay: 0.5, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 0.8, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 1.1, y: skyY(0) },
        { enemyType: 'bomber_ship', side: 'random', delay: 1.5, y: skyY(4) },
        { enemyType: 'drop_carrier', side: 'random', delay: 1.9, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.3, y: skyY(2) },
      ],
    },
  ],
};

export const LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3];

export function getLevelById(id: number): LevelConfig {
  return LEVELS.find((l) => l.id === id) ?? LEVEL_1;
}
