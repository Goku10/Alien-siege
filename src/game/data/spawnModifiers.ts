import type { FlyerSpawnModifiers, GroundSpawnModifiers } from '../types';
import type { LevelScaling } from './levelScaling';

export function flyerModifiersFromScaling(scaling: LevelScaling): FlyerSpawnModifiers {
  return {
    speedMultiplier: scaling.speedMultiplier,
    healthMultiplier: scaling.healthMultiplier,
    scoreMultiplier: scaling.scoreMultiplier,
    dropIntervalScale: scaling.dropIntervalScale,
    maxDropsBonus: scaling.maxDropsBonus,
  };
}

export function groundModifiersFromScaling(scaling: LevelScaling): GroundSpawnModifiers {
  return {
    speedMultiplier: scaling.groundSpeedMultiplier,
    healthMultiplier: scaling.groundHealthMultiplier,
  };
}

export const NEUTRAL_FLYER_MODIFIERS: FlyerSpawnModifiers = {
  speedMultiplier: 1,
  healthMultiplier: 1,
  scoreMultiplier: 1,
  dropIntervalScale: 1,
  maxDropsBonus: 0,
};
