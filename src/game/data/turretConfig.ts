/**
 * Turret mount configuration (rotation, placement).
 * Weapon stats live in weapons.ts and are applied via ShopManager loadout.
 */

export const TURRET_CONFIG = {
  rotationSpeed: 12,
  keyboardRotationSpeed: 3.5,
  barrelLength: 48,
  bodyRadius: 28,
  minAngle: -Math.PI * 0.92,
  maxAngle: -Math.PI * 0.08,
  overheatPenalty: 0.5,
} as const;

export { MACHINE_GUN } from './weapons';
