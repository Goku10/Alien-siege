/**
 * Data-driven wave blueprints — tune enemy mix and pacing per level here.
 */
import type { EnemyTypeId, SpawnSide } from '../types';
import type { WaveConfig, WaveSpawn } from './levels';

const SKY_Y_MIN = 90;
const SKY_Y_MAX = 300;

function skyY(slot: number): number {
  const range = SKY_Y_MAX - SKY_Y_MIN;
  return SKY_Y_MIN + (range / 5) * (slot % 5);
}

export type WavePacing = 'relaxed' | 'standard' | 'intense';

export interface BlueprintSpawn {
  type: EnemyTypeId;
  count: number;
  startDelay: number;
  spacing: number;
  side: SpawnSide | 'alternate' | 'random';
  skySlot?: number;
}

export interface WaveBlueprint {
  id: string;
  label: string;
  pacing: WavePacing;
  spawns: BlueprintSpawn[];
  clearBonus: number;
}

const PACING_DELAY: Record<WavePacing, number> = {
  relaxed: 1.0,
  standard: 0.85,
  intense: 0.7,
};

export interface LevelWaveProfile {
  levelId: number;
  blueprintIds: string[];
}

function resolveSide(
  pattern: SpawnSide | 'alternate' | 'random',
  index: number,
): SpawnSide {
  if (pattern === 'alternate') return index % 2 === 0 ? 'left' : 'right';
  if (pattern === 'random') return Math.random() < 0.5 ? 'left' : 'right';
  return pattern;
}

function blueprintToWave(blueprint: WaveBlueprint): WaveConfig {
  const delayScale = PACING_DELAY[blueprint.pacing];
  const spawns: WaveSpawn[] = [];
  let spawnIndex = 0;

  for (const group of blueprint.spawns) {
    for (let i = 0; i < group.count; i += 1) {
      const delay = (group.startDelay + i * group.spacing) * delayScale;
      spawns.push({
        enemyType: group.type,
        side: resolveSide(group.side, spawnIndex),
        delay,
        y: skyY(group.skySlot ?? spawnIndex % 5),
      });
      spawnIndex += 1;
    }
  }

  spawns.sort((a, b) => a.delay - b.delay);

  return {
    id: 0,
    clearBonus: blueprint.clearBonus,
    spawns,
  };
}

export const WAVE_BLUEPRINTS: Record<string, WaveBlueprint> = {
  scout_skirmish: {
    id: 'scout_skirmish',
    label: 'Scout Skirmish',
    pacing: 'relaxed',
    clearBonus: 150,
    spawns: [
      { type: 'scout_saucer', count: 4, startDelay: 0.5, spacing: 0.65, side: 'alternate', skySlot: 1 },
      { type: 'scout_saucer', count: 1, startDelay: 2.8, spacing: 0, side: 'random', skySlot: 3 },
    ],
  },
  carrier_intro: {
    id: 'carrier_intro',
    label: 'Carrier Intro',
    pacing: 'standard',
    clearBonus: 200,
    spawns: [
      { type: 'scout_saucer', count: 2, startDelay: 0.4, spacing: 0.55, side: 'alternate', skySlot: 0 },
      { type: 'drop_carrier', count: 1, startDelay: 1.2, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'scout_saucer', count: 2, startDelay: 1.8, spacing: 0.5, side: 'random', skySlot: 4 },
    ],
  },
  carrier_push: {
    id: 'carrier_push',
    label: 'Carrier Push',
    pacing: 'standard',
    clearBonus: 250,
    spawns: [
      { type: 'drop_carrier', count: 2, startDelay: 0.5, spacing: 0.9, side: 'alternate', skySlot: 2 },
      { type: 'scout_saucer', count: 3, startDelay: 1.0, spacing: 0.45, side: 'random', skySlot: 1 },
    ],
  },
  bomber_tease: {
    id: 'bomber_tease',
    label: 'Bomber Tease',
    pacing: 'standard',
    clearBonus: 280,
    spawns: [
      { type: 'bomber_ship', count: 1, startDelay: 0.6, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'drop_carrier', count: 1, startDelay: 1.1, spacing: 0, side: 'right', skySlot: 1 },
      { type: 'scout_saucer', count: 2, startDelay: 1.6, spacing: 0.5, side: 'random', skySlot: 3 },
    ],
  },
  shield_escort: {
    id: 'shield_escort',
    label: 'Shield Escort',
    pacing: 'standard',
    clearBonus: 300,
    spawns: [
      { type: 'shielded_transport', count: 1, startDelay: 0.5, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'scout_saucer', count: 3, startDelay: 0.8, spacing: 0.4, side: 'alternate', skySlot: 0 },
      { type: 'drop_carrier', count: 1, startDelay: 1.8, spacing: 0, side: 'right', skySlot: 4 },
    ],
  },
  bomber_run: {
    id: 'bomber_run',
    label: 'Bomber Run',
    pacing: 'intense',
    clearBonus: 320,
    spawns: [
      { type: 'bomber_ship', count: 2, startDelay: 0.35, spacing: 0.75, side: 'alternate', skySlot: 2 },
      { type: 'scout_saucer', count: 2, startDelay: 1.0, spacing: 0.4, side: 'random', skySlot: 1 },
    ],
  },
  swarm_probe: {
    id: 'swarm_probe',
    label: 'Swarm Probe',
    pacing: 'standard',
    clearBonus: 280,
    spawns: [
      { type: 'drone_swarm_pod', count: 1, startDelay: 0.4, spacing: 0, side: 'random', skySlot: 2 },
      { type: 'scout_saucer', count: 4, startDelay: 0.6, spacing: 0.35, side: 'alternate', skySlot: 0 },
      { type: 'drop_carrier', count: 1, startDelay: 1.6, spacing: 0, side: 'left', skySlot: 3 },
    ],
  },
  heavy_assault: {
    id: 'heavy_assault',
    label: 'Heavy Assault',
    pacing: 'intense',
    clearBonus: 380,
    spawns: [
      { type: 'shielded_transport', count: 1, startDelay: 0.3, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'bomber_ship', count: 1, startDelay: 0.7, spacing: 0, side: 'right', skySlot: 1 },
      { type: 'drop_carrier', count: 2, startDelay: 1.0, spacing: 0.6, side: 'alternate', skySlot: 3 },
      { type: 'scout_saucer', count: 2, startDelay: 1.8, spacing: 0.35, side: 'random', skySlot: 4 },
    ],
  },
  swarm_barrage: {
    id: 'swarm_barrage',
    label: 'Swarm Barrage',
    pacing: 'intense',
    clearBonus: 400,
    spawns: [
      { type: 'drone_swarm_pod', count: 2, startDelay: 0.25, spacing: 0.8, side: 'alternate', skySlot: 2 },
      { type: 'scout_saucer', count: 3, startDelay: 0.5, spacing: 0.3, side: 'random', skySlot: 0 },
      { type: 'bomber_ship', count: 1, startDelay: 1.4, spacing: 0, side: 'random', skySlot: 4 },
    ],
  },
  elite_drop: {
    id: 'elite_drop',
    label: 'Elite Drop',
    pacing: 'standard',
    clearBonus: 420,
    spawns: [
      { type: 'elite_bio_pod', count: 1, startDelay: 0.4, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'shielded_transport', count: 1, startDelay: 0.9, spacing: 0, side: 'right', skySlot: 1 },
      { type: 'scout_saucer', count: 3, startDelay: 1.2, spacing: 0.4, side: 'alternate', skySlot: 3 },
    ],
  },
  final_breach: {
    id: 'final_breach',
    label: 'Final Breach',
    pacing: 'intense',
    clearBonus: 500,
    spawns: [
      { type: 'elite_bio_pod', count: 1, startDelay: 0.2, spacing: 0, side: 'left', skySlot: 2 },
      { type: 'drone_swarm_pod', count: 1, startDelay: 0.45, spacing: 0, side: 'right', skySlot: 0 },
      { type: 'bomber_ship', count: 2, startDelay: 0.7, spacing: 0.55, side: 'alternate', skySlot: 3 },
      { type: 'drop_carrier', count: 2, startDelay: 1.1, spacing: 0.5, side: 'random', skySlot: 4 },
      { type: 'shielded_transport', count: 1, startDelay: 1.6, spacing: 0, side: 'random', skySlot: 1 },
    ],
  },
};

const LEVEL_PROFILES: LevelWaveProfile[] = [
  {
    levelId: 1,
    blueprintIds: ['scout_skirmish', 'carrier_intro', 'carrier_push', 'bomber_tease'],
  },
  {
    levelId: 2,
    blueprintIds: ['carrier_push', 'bomber_run', 'swarm_probe', 'shield_escort', 'heavy_assault'],
  },
  {
    levelId: 3,
    blueprintIds: ['heavy_assault', 'swarm_barrage', 'elite_drop', 'bomber_run', 'final_breach'],
  },
];

export function buildWavesForLevel(levelId: number): WaveConfig[] {
  const profile = LEVEL_PROFILES.find((p) => p.levelId === levelId) ?? LEVEL_PROFILES[0];
  return profile.blueprintIds.map((id, index) => {
    const blueprint = WAVE_BLUEPRINTS[id];
    const wave = blueprintToWave(blueprint);
    wave.id = index + 1;
    return wave;
  });
}
