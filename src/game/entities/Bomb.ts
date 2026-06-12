import { BALANCING } from '../data/balancing';
import type { BombState } from '../types';
import { ObjectPool } from '../../utils/objectPool';

let nextId = 1;

function create(): BombState {
  return {
    id: 0, x: 0, y: 0, vy: 0, radius: 0, health: 0, maxHealth: 0,
    damage: 0, scoreValue: 0, active: false, flashTimer: 0,
  };
}

function reset(b: BombState): void {
  b.id = nextId++;
  b.active = true;
  b.flashTimer = 0;
}

export const bombPool = new ObjectPool(create, reset, 16);

export function spawnBomb(x: number, y: number): BombState {
  const b = bombPool.acquire();
  b.x = x;
  b.y = y;
  b.vy = BALANCING.threats.bombFallSpeed;
  b.radius = BALANCING.threats.bombRadius;
  b.health = BALANCING.threats.bombHealth;
  b.maxHealth = BALANCING.threats.bombHealth;
  b.damage = BALANCING.base.bombDamage;
  b.scoreValue = BALANCING.threats.bombScore;
  return b;
}

export function updateBomb(b: BombState, dt: number, groundY: number): 'falling' | 'impact' | 'dead' {
  if (!b.active) return 'dead';
  if (b.flashTimer > 0) b.flashTimer -= dt;

  b.y += b.vy * dt;
  if (b.y >= groundY - b.radius) {
    return 'impact';
  }
  return 'falling';
}

export function damageBomb(b: BombState, amount: number): void {
  b.health -= amount;
  b.flashTimer = 0.08;
}
