import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import { isInBreachZone, type BaseLayout } from '../utils/baseLayout';
import type { GroundEnemyState, GroundEnemyTypeId } from '../types';
import { ObjectPool } from '../../utils/objectPool';

let nextId = 1;

function create(): GroundEnemyState {
  return {
    id: 0, typeId: 'crawler', x: 0, y: 0, vx: 0, health: 0, maxHealth: 0,
    radius: 0, active: false, flashTimer: 0, scoreValue: 0, breachRate: 0,
    breachBurst: 0, attackDamage: 0, attackInterval: 0, attackRange: 0,
    attackTimer: 0, breachContributed: 0, behavior: 'approaching', leapTimer: 0,
    leapDuration: 0, targetX: 0,
  };
}

function reset(g: GroundEnemyState): void {
  g.id = nextId++;
  g.active = true;
  g.flashTimer = 0;
  g.behavior = 'approaching';
  g.attackTimer = 0;
  g.breachContributed = 0;
  g.leapTimer = 0;
}

export const groundEnemyPool = new ObjectPool(create, reset, 24);

export function spawnGroundEnemy(
  typeId: GroundEnemyTypeId,
  x: number,
  y: number,
  layout: BaseLayout,
): GroundEnemyState {
  const def = GROUND_ENEMY_DEFINITIONS[typeId];
  const g = groundEnemyPool.acquire();
  g.typeId = typeId;
  g.x = x;
  g.y = y;
  g.targetX = layout.centerX;
  g.vx = x < layout.centerX ? def.speed : -def.speed;
  g.health = def.health;
  g.maxHealth = def.health;
  g.radius = def.radius;
  g.scoreValue = def.score;
  g.breachRate = def.breachRate;
  g.breachBurst = def.breachBurst;
  g.attackDamage = def.attackDamage;
  g.attackInterval = def.attackInterval;
  g.attackRange = def.attackRange;
  return g;
}

export function damageGroundEnemy(g: GroundEnemyState, amount: number): void {
  g.health -= amount;
  g.flashTimer = 0.1;
}

export interface GroundUpdateResult {
  breachDelta: number;
  baseDamage: number;
  breachBurst: number;
}

export function updateGroundEnemy(
  g: GroundEnemyState,
  dt: number,
  layout: BaseLayout,
): GroundUpdateResult {
  const result: GroundUpdateResult = { breachDelta: 0, baseDamage: 0, breachBurst: 0 };
  if (!g.active) return result;
  if (g.flashTimer > 0) g.flashTimer -= dt;

  const def = GROUND_ENEMY_DEFINITIONS[g.typeId];
  const dir = Math.sign(layout.centerX - g.x) || 1;
  const atBreach = isInBreachZone(g.x, layout);
  g.y = layout.walkY;

  if (g.typeId === 'leaper') {
    g.leapTimer += dt;
    if (g.leapTimer >= 1.4 && !atBreach) {
      g.leapTimer = 0;
      g.x += dir * 55;
    } else {
      g.x += dir * def.speed * dt;
    }
    if (atBreach) {
      g.behavior = 'breaching';
      result.breachDelta += g.breachRate * dt;
      if (g.breachBurst > 0) {
        result.breachBurst = g.breachBurst;
        g.breachBurst = 0;
      }
    }
  } else if (g.typeId === 'spitter') {
    const dist = Math.abs(g.x - layout.centerX);
    if (atBreach && dist <= g.attackRange) {
      g.behavior = 'attacking';
      g.attackTimer += dt;
      if (g.attackTimer >= g.attackInterval) {
        g.attackTimer = 0;
        result.baseDamage = g.attackDamage;
      }
      result.breachDelta += g.breachRate * dt;
    } else {
      g.x += dir * def.speed * dt;
      if (atBreach) result.breachDelta += g.breachRate * dt * 0.5;
    }
  } else {
    g.x += dir * def.speed * dt;
    if (atBreach) {
      g.behavior = 'breaching';
      result.breachDelta += g.breachRate * dt;
    }
  }

  return result;
}
