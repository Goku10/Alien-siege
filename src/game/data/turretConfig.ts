/**
 * Turret and starter weapon configuration.
 * Phase 1: Machine Gun prototype stats.
 */

export const TURRET_CONFIG = {
  rotationSpeed: 12,
  keyboardRotationSpeed: 3.5,
  barrelLength: 48,
  bodyRadius: 28,
  minAngle: -Math.PI * 0.92,
  maxAngle: -Math.PI * 0.08,
} as const;

export const MACHINE_GUN = {
  id: 'machine_gun',
  name: 'Machine Gun',
  damage: 8,
  fireRate: 10,
  projectileSpeed: 900,
  projectileRadius: 3,
  projectileLife: 1.8,
  heatPerShot: 4,
  maxHeat: 100,
  coolRate: 35,
  overheatPenalty: 0.5,
  muzzleFlashDuration: 0.06,
  trailLength: 6,
} as const;
