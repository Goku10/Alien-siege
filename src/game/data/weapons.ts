/**
 * Weapon stat catalog — base values before shop upgrades apply.
 */

export interface WeaponStats {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileLife: number;
  heatPerShot: number;
  maxHeat: number;
  coolRate: number;
  muzzleFlashDuration: number;
  trailLength: number;
}

export type WeaponId = 'machine_gun' | 'plasma_rifle' | 'scatter_cannon';

export const MACHINE_GUN: WeaponStats = {
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
  muzzleFlashDuration: 0.06,
  trailLength: 6,
};

export const PLASMA_RIFLE: WeaponStats = {
  id: 'plasma_rifle',
  name: 'Plasma Rifle',
  damage: 14,
  fireRate: 6.5,
  projectileSpeed: 780,
  projectileRadius: 4,
  projectileLife: 2.0,
  heatPerShot: 6,
  maxHeat: 100,
  coolRate: 30,
  muzzleFlashDuration: 0.08,
  trailLength: 8,
};

export const SCATTER_CANNON: WeaponStats = {
  id: 'scatter_cannon',
  name: 'Scatter Cannon',
  damage: 5,
  fireRate: 14,
  projectileSpeed: 820,
  projectileRadius: 2.5,
  projectileLife: 1.4,
  heatPerShot: 3,
  maxHeat: 110,
  coolRate: 40,
  muzzleFlashDuration: 0.05,
  trailLength: 4,
};

export const WEAPONS: Record<WeaponId, WeaponStats> = {
  machine_gun: MACHINE_GUN,
  plasma_rifle: PLASMA_RIFLE,
  scatter_cannon: SCATTER_CANNON,
};
