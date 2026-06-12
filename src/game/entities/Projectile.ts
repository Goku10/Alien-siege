import { MACHINE_GUN } from '../data/turretConfig';
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
    damage: MACHINE_GUN.damage,
    radius: MACHINE_GUN.projectileRadius,
    life: 0,
    maxLife: MACHINE_GUN.projectileLife,
    active: false,
    trail: [],
  };
}

function resetProjectile(p: ProjectileState): void {
  p.id = nextProjectileId++;
  p.x = 0;
  p.y = 0;
  p.vx = 0;
  p.vy = 0;
  p.damage = MACHINE_GUN.damage;
  p.radius = MACHINE_GUN.projectileRadius;
  p.life = MACHINE_GUN.projectileLife;
  p.maxLife = MACHINE_GUN.projectileLife;
  p.active = true;
  p.trail.length = 0;
}

export const projectilePool = new ObjectPool(createProjectile, resetProjectile, 64);

export function spawnProjectile(
  x: number,
  y: number,
  angle: number,
  speed: number = MACHINE_GUN.projectileSpeed,
): ProjectileState {
  const p = projectilePool.acquire();
  p.x = x;
  p.y = y;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed;
  return p;
}

export function updateProjectile(p: ProjectileState, dt: number, boundsW: number, boundsH: number): boolean {
  if (!p.active) return false;

  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > MACHINE_GUN.trailLength) {
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
