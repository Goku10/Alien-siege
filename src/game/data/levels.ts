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
  waves: WaveConfig[];
}

const SKY_Y_MIN = 90;
const SKY_Y_MAX = 300;

function skyY(slot: number): number {
  const range = SKY_Y_MAX - SKY_Y_MIN;
  return SKY_Y_MIN + (range / 5) * slot;
}

/** Level 1 wave layouts — tuned for Phase 2 combat loop */
export const LEVEL_1: LevelConfig = {
  id: 1,
  name: 'Perimeter Defense',
  waves: [
    {
      id: 1,
      clearBonus: 150,
      spawns: [
        { enemyType: 'scout_saucer', side: 'left', delay: 0.5, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.2, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'left', delay: 2.0, y: skyY(3) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.8, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.6, y: skyY(4) },
      ],
    },
    {
      id: 2,
      clearBonus: 200,
      spawns: [
        { enemyType: 'scout_saucer', side: 'left', delay: 0.4, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'right', delay: 0.9, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 1.8, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.5, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'left', delay: 3.2, y: skyY(4) },
      ],
    },
    {
      id: 3,
      clearBonus: 250,
      spawns: [
        { enemyType: 'drop_carrier', side: 'left', delay: 0.5, y: skyY(1) },
        { enemyType: 'drop_carrier', side: 'right', delay: 1.0, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'left', delay: 1.6, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'right', delay: 2.1, y: skyY(4) },
        { enemyType: 'scout_saucer', side: 'random', delay: 2.8, y: skyY(3) },
      ],
    },
    {
      id: 4,
      clearBonus: 300,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.6, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.2, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'left', delay: 1.8, y: skyY(4) },
        { enemyType: 'drop_carrier', side: 'right', delay: 2.5, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.2, y: skyY(3) },
      ],
    },
    {
      id: 5,
      clearBonus: 400,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.5, y: skyY(1) },
        { enemyType: 'bomber_ship', side: 'right', delay: 1.2, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'left', delay: 2.0, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 2.6, y: skyY(0) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.2, y: skyY(4) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.8, y: skyY(1) },
      ],
    },
    {
      id: 6,
      clearBonus: 500,
      spawns: [
        { enemyType: 'bomber_ship', side: 'left', delay: 0.3, y: skyY(2) },
        { enemyType: 'drop_carrier', side: 'right', delay: 0.7, y: skyY(1) },
        { enemyType: 'scout_saucer', side: 'left', delay: 1.1, y: skyY(4) },
        { enemyType: 'scout_saucer', side: 'right', delay: 1.5, y: skyY(0) },
        { enemyType: 'bomber_ship', side: 'random', delay: 2.0, y: skyY(3) },
        { enemyType: 'drop_carrier', side: 'random', delay: 2.5, y: skyY(2) },
        { enemyType: 'scout_saucer', side: 'random', delay: 3.0, y: skyY(1) },
      ],
    },
  ],
};

export const LEVELS: LevelConfig[] = [LEVEL_1];
