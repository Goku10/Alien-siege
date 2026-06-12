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
    kind: 'bullet',
    splashRadius: 0,
    pierceRemaining: 0,
    color: '#fff8d0',
    glowColor: 'rgba(255, 180, 60, 0.6)',
    trailLength: 6,
  };
}

function resetProjectile(p: ProjectileState): void {
  p.id = nextProjectileId++;
  p.active = true;
  p.trail.length = 0;
}

export const projectilePool = new ObjectPool(createProjectile, resetProjectile, 96);

export function spawnWeaponProjectiles(
  x: number,
  y: number,
  angle: number,
  weapon: WeaponStats,
): ProjectileState[] {
  const pellets = Math.max(1, weapon.pelletsPerShot);
  const projectiles: ProjectileState[] = [];

  for (let i = 0; i < pellets; i++) {
    const spreadOffset =
      pellets === 1
        ? 0
        : (i / (pellets - 1) - 0.5) * weapon.pelletSpread;
    const shotAngle = angle + spreadOffset;
    const p = projectilePool.acquire();

    p.x = x;
    p.y = y;
    p.vx = Math.cos(shotAngle) * weapon.projectileSpeed;
    p.vy = Math.sin(shotAngle) * weapon.projectileSpeed;
    p.damage = weapon.damage;
    p.radius = weapon.projectileRadius;
    p.life = weapon.projectileLife;
    p.maxLife = weapon.projectileLife;
    p.kind = weapon.kind;
    p.splashRadius = weapon.splashRadius;
    p.pierceRemaining = weapon.pierceCount;
    p.color = weapon.color;
    p.glowColor = weapon.glowColor;
    p.trailLength = weapon.trailLength;

    projectiles.push(p);
  }

  return projectiles;
}

export function updateProjectile(
  p: ProjectileState,
  dt: number,
  boundsW: number,
  boundsH: number,
): 'alive' | 'expired' | 'dead' {
  if (!p.active) return 'dead';

  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > p.trailLength) {
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

  if (p.life <= 0) {
    const airburst = p.kind === 'missile' && p.splashRadius > 0;
    p.active = false;
    projectilePool.release(p);
    return airburst ? 'expired' : 'dead';
  }

  if (offScreen) {
    p.active = false;
    projectilePool.release(p);
    return 'dead';
  }

  return 'alive';
}
