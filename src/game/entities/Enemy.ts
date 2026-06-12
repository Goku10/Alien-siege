import { BALANCING } from '../data/balancing';
import { ENEMY_DEFINITIONS } from '../data/enemies';
import type { EnemyState, EnemyTypeId, SpawnSide } from '../types';
import { ObjectPool } from '../../utils/objectPool';

let nextEnemyId = 1;

function createEnemy(): EnemyState {
  return {
    id: 0,
    typeId: 'scout_saucer',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    health: 0,
    maxHealth: 0,
    radius: 0,
    active: false,
    side: 'left',
    pattern: 'straight',
    patternPhase: 0,
    patternAmplitude: 0,
    patternFrequency: 0,
    baseY: 0,
    scoreValue: 0,
    flashTimer: 0,
  };
}

function resetEnemy(e: EnemyState): void {
  e.id = nextEnemyId++;
  e.active = true;
  e.flashTimer = 0;
  e.patternPhase = 0;
}

export const enemyPool = new ObjectPool(createEnemy, resetEnemy, 32);

function randomSkyY(): number {
  const { skyYMin, skyYMax } = BALANCING.waves;
  return skyYMin + Math.random() * (skyYMax - skyYMin);
}

export function spawnEnemy(
  typeId: EnemyTypeId,
  side: SpawnSide,
  boundsW: number,
  y?: number,
): EnemyState {
  const def = ENEMY_DEFINITIONS[typeId];
  const spawnY = y ?? randomSkyY();
  const dir = side === 'left' ? 1 : -1;

  const enemy = enemyPool.acquire();
  enemy.typeId = typeId;
  enemy.x = side === 'left' ? -def.radius - 20 : boundsW + def.radius + 20;
  enemy.y = spawnY;
  enemy.baseY = spawnY;
  enemy.vx = dir * def.speed;
  enemy.vy = 0;
  enemy.health = def.health;
  enemy.maxHealth = def.health;
  enemy.radius = def.radius;
  enemy.side = side;
  enemy.pattern = def.pattern;
  enemy.patternPhase = Math.random() * Math.PI * 2;
  enemy.patternAmplitude = def.patternAmplitude;
  enemy.patternFrequency = def.patternFrequency;
  enemy.scoreValue = def.score;
  return enemy;
}

export function updateEnemy(enemy: EnemyState, dt: number, boundsW: number): boolean {
  if (!enemy.active) return false;

  enemy.patternPhase += dt;
  if (enemy.flashTimer > 0) enemy.flashTimer -= dt;

  enemy.x += enemy.vx * dt;

  switch (enemy.pattern) {
    case 'sine':
    case 'bob':
      enemy.y =
        enemy.baseY +
        Math.sin(enemy.patternPhase * enemy.patternFrequency) * enemy.patternAmplitude;
      break;
    case 'arc':
      enemy.y =
        enemy.baseY +
        Math.sin(enemy.patternPhase * enemy.patternFrequency) *
          enemy.patternAmplitude *
          (0.5 + 0.5 * Math.sin(enemy.patternPhase * 0.7));
      break;
    case 'straight':
    default:
      break;
  }

  const exited =
    (enemy.side === 'left' && enemy.x > boundsW + enemy.radius + 40) ||
    (enemy.side === 'right' && enemy.x < -enemy.radius - 40);

  if (exited || enemy.health <= 0) {
    enemy.active = false;
    enemyPool.release(enemy);
    return false;
  }
  return true;
}

export function damageEnemy(enemy: EnemyState, amount: number): void {
  enemy.health -= amount;
  enemy.flashTimer = 0.1;
}
