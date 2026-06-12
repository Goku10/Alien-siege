import { ENEMY_DEFINITIONS } from '../data/enemies';
import { damageEnemy } from '../entities/Enemy';
import { projectilePool } from '../entities/Projectile';
import type { EnemyState, ProjectileState } from '../types';
import { EconomyManager } from './EconomyManager';
import { EffectsManager } from './EffectsManager';

export interface CollisionCallbacks {
  onEnemyKilled?: (points: number) => void;
  onScreenShake?: (amount: number) => void;
  onHit?: () => void;
}

export class CollisionSystem {
  process(
    projectiles: ProjectileState[],
    enemies: EnemyState[],
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks = {},
  ): void {
    for (const proj of projectiles) {
      if (!proj.active) continue;

      for (const enemy of enemies) {
        if (!enemy.active || enemy.health <= 0) continue;

        const dx = proj.x - enemy.x;
        const dy = proj.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        const hitRadius = proj.radius + enemy.radius;

        if (distSq > hitRadius * hitRadius) continue;

        damageEnemy(enemy, proj.damage);
        effects.spawnHitSparks(proj.x, proj.y, enemy.typeId);
        callbacks.onHit?.();

        proj.active = false;
        projectilePool.release(proj);

        if (enemy.health <= 0) {
          const def = ENEMY_DEFINITIONS[enemy.typeId];
          const points = economy.registerKill(enemy.scoreValue);
          effects.spawnExplosion(enemy.x, enemy.y, enemy.radius, def.accentColor);
          effects.spawnScorePopup(enemy.x, enemy.y - 20, `+${points}`);
          callbacks.onEnemyKilled?.(points);
          callbacks.onScreenShake?.(def.shakeOnDeath);
          // Audio hook: playEnemyExplosion()
        }

        break;
      }
    }
  }
}
