import type { WeaponStats } from '../data/weapons';
import type { ProjectileState } from '../types';
import { ObjectPool } from '../../utils/objectPool';

let nextProjectileId = 1;

function createProjectile(): ProjectileState {
  return {
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    damage: 0,
    radius: 0,
    life: 0,
    maxLife: 0,
    active: false,
    trail: [],
  };
}

function resetProjectile(p: ProjectileState): void {
  p.id = nextProjectileId++;
  p.active = true;
  p.trail.length = 0;
}

export const projectilePool = new ObjectPool(createProjectile, resetProjectile, 64);

export function spawnProjectile(
  x: number,
  y: number,
  angle: number,
  weapon: WeaponStats,
): ProjectileState {
  const p = projectilePool.acquire();
  p.x = x;
  p.y = y;
  p.vx = Math.cos(angle) * weapon.projectileSpeed;
  p.vy = Math.sin(angle) * weapon.projectileSpeed;
  p.damage = weapon.damage;
  p.radius = weapon.projectileRadius;
  p.life = weapon.projectileLife;
  p.maxLife = weapon.projectileLife;
  return p;
}

export function updateProjectile(
  p: ProjectileState,
  dt: number,
  boundsW: number,
  boundsH: number,
  trailLength: number,
): boolean {
  if (!p.active) return false;

  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > trailLength) {
    p.trail.shift();
  }

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;

  const offScreen =
    p.x < -20 ||
    p.x > boundsW + 20 ||
    p.y < -20 ||
    p.y > boundsH + 20;

  if (p.life <= 0 || offScreen) {
    p.active = false;
    projectilePool.release(p);
    return false;
  }
  return true;
}
