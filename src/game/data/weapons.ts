/**
 * Weapon catalog — base stats before shop upgrades apply.
 * Add new entries here and matching shop items to extend the arsenal.
 */

export type WeaponId =
  | 'machine_gun'
  | 'laser_cannon'
  | 'missile_launcher'
  | 'flak_cannon'
  | 'plasma_blaster';

export type WeaponKind = 'bullet' | 'laser' | 'missile' | 'flak' | 'plasma';

export interface WeaponStats {
  id: WeaponId;
  name: string;
  kind: WeaponKind;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileLife: number;
  /** AoE radius on impact; 0 = none */
  splashRadius: number;
  /** Pellets per trigger pull (flak) */
  pelletsPerShot: number;
  /** Total spread cone in radians */
  pelletSpread: number;
  /** Extra targets pierced after the first (laser) */
  pierceCount: number;
  heatPerShot: number;
  maxHeat: number;
  coolRate: number;
  /** 0 = infinite ammo */
  magazineSize: number;
  reloadTime: number;
  muzzleFlashDuration: number;
  trailLength: number;
  color: string;
  glowColor: string;
}

export const MACHINE_GUN: WeaponStats = {
  id: 'machine_gun',
  name: 'Machine Gun',
  kind: 'bullet',
  damage: 8,
  fireRate: 10,
  projectileSpeed: 920,
  projectileRadius: 3,
  projectileLife: 1.8,
  splashRadius: 0,
  pelletsPerShot: 1,
  pelletSpread: 0,
  pierceCount: 0,
  heatPerShot: 4,
  maxHeat: 100,
  coolRate: 38,
  magazineSize: 0,
  reloadTime: 0,
  muzzleFlashDuration: 0.06,
  trailLength: 6,
  color: '#fff8d0',
  glowColor: 'rgba(255, 180, 60, 0.6)',
};

/** Piercing beam — high damage, low cadence, melts lines of hostiles */
export const LASER_CANNON: WeaponStats = {
  id: 'laser_cannon',
  name: 'Laser Cannon',
  kind: 'laser',
  damage: 26,
  fireRate: 2.4,
  projectileSpeed: 2800,
  projectileRadius: 2,
  projectileLife: 0.45,
  splashRadius: 0,
  pelletsPerShot: 1,
  pelletSpread: 0,
  pierceCount: 4,
  heatPerShot: 18,
  maxHeat: 100,
  coolRate: 42,
  magazineSize: 0,
  reloadTime: 0,
  muzzleFlashDuration: 0.1,
  trailLength: 14,
  color: '#7df9ff',
  glowColor: 'rgba(0, 220, 255, 0.75)',
};

/** Single heavy round — slow shot, reload gate, large explosion */
export const MISSILE_LAUNCHER: WeaponStats = {
  id: 'missile_launcher',
  name: 'Missile Launcher',
  kind: 'missile',
  damage: 48,
  fireRate: 0.7,
  projectileSpeed: 460,
  projectileRadius: 7,
  projectileLife: 3.2,
  splashRadius: 58,
  pelletsPerShot: 1,
  pelletSpread: 0,
  pierceCount: 0,
  heatPerShot: 0,
  maxHeat: 100,
  coolRate: 20,
  magazineSize: 1,
  reloadTime: 2.1,
  muzzleFlashDuration: 0.12,
  trailLength: 8,
  color: '#ff6b35',
  glowColor: 'rgba(255, 100, 40, 0.8)',
};

/** Shrapnel burst — many pellets with mini splash, anti-swarm */
export const FLAK_CANNON: WeaponStats = {
  id: 'flak_cannon',
  name: 'Flak Cannon',
  kind: 'flak',
  damage: 5,
  fireRate: 1.1,
  projectileSpeed: 720,
  projectileRadius: 2.5,
  projectileLife: 1.1,
  splashRadius: 22,
  pelletsPerShot: 7,
  pelletSpread: 0.38,
  pierceCount: 0,
  heatPerShot: 14,
  maxHeat: 100,
  coolRate: 32,
  magazineSize: 4,
  reloadTime: 1.6,
  muzzleFlashDuration: 0.08,
  trailLength: 3,
  color: '#ffd166',
  glowColor: 'rgba(255, 200, 80, 0.65)',
};

/** Energy bolts — medium pace with splash blobs */
export const PLASMA_BLASTER: WeaponStats = {
  id: 'plasma_blaster',
  name: 'Plasma Blaster',
  kind: 'plasma',
  damage: 15,
  fireRate: 4.2,
  projectileSpeed: 640,
  projectileRadius: 5,
  projectileLife: 2.0,
  splashRadius: 30,
  pelletsPerShot: 1,
  pelletSpread: 0,
  pierceCount: 0,
  heatPerShot: 9,
  maxHeat: 100,
  coolRate: 34,
  magazineSize: 0,
  reloadTime: 0,
  muzzleFlashDuration: 0.07,
  trailLength: 7,
  color: '#c77dff',
  glowColor: 'rgba(180, 80, 255, 0.7)',
};

export const WEAPONS: Record<WeaponId, WeaponStats> = {
  machine_gun: MACHINE_GUN,
  laser_cannon: LASER_CANNON,
  missile_launcher: MISSILE_LAUNCHER,
  flak_cannon: FLAK_CANNON,
  plasma_blaster: PLASMA_BLASTER,
};

export const WEAPON_LIST: WeaponStats[] = Object.values(WEAPONS);
