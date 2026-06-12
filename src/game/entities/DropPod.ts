import { BALANCING } from '../data/balancing';
import type { DropPodState, GroundEnemyTypeId } from '../types';
import { ObjectPool } from '../../utils/objectPool';

let nextId = 1;

function create(): DropPodState {
  return {
    id: 0, x: 0, y: 0, vy: 0, radius: 0, health: 0, maxHealth: 0,
    scoreValue: 0, payload: 'crawler', active: false, flashTimer: 0,
  };
}

function reset(p: DropPodState): void {
  p.id = nextId++;
  p.active = true;
  p.flashTimer = 0;
}

export const dropPodPool = new ObjectPool(create, reset, 16);

export function spawnDropPod(x: number, y: number, payload: GroundEnemyTypeId): DropPodState {
  const p = dropPodPool.acquire();
  p.x = x;
  p.y = y;
  p.vy = BALANCING.threats.podFallSpeed;
  p.radius = BALANCING.threats.podRadius;
  p.health = BALANCING.threats.podHealth;
  p.maxHealth = BALANCING.threats.podHealth;
  p.scoreValue = BALANCING.threats.podScore;
  p.payload = payload;
  return p;
}

export function updateDropPod(p: DropPodState, dt: number, groundY: number): 'falling' | 'landed' | 'dead' {
  if (!p.active) return 'dead';
  if (p.flashTimer > 0) p.flashTimer -= dt;

  p.y += p.vy * dt;
  if (p.y >= groundY - p.radius) {
    p.y = groundY - p.radius;
    return 'landed';
  }
  return 'falling';
}

export function damageDropPod(p: DropPodState, amount: number): void {
  p.health -= amount;
  p.flashTimer = 0.08;
}
