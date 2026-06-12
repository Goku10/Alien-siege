import { ENEMY_DEFINITIONS } from '../data/enemies';
import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import { damageBomb } from '../entities/Bomb';
import { damageDropPod } from '../entities/DropPod';
import { damageEnemy } from '../entities/Enemy';
import { damageGroundEnemy } from '../entities/GroundEnemy';
import { projectilePool } from '../entities/Projectile';
import type { EnemyState, GroundEnemyState, ProjectileState } from '../types';
import { EconomyManager } from './EconomyManager';
import { EffectsManager } from './EffectsManager';
import type { BossManager } from './BossManager';
import type { EntityManager } from './EntityManager';

export interface CollisionCallbacks {
  onScreenShake?: (amount: number) => void;
  onHit?: () => void;
}

function circleHit(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

export class CollisionSystem {
  process(
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    bosses: BossManager | null,
    callbacks: CollisionCallbacks = {},
  ): void {
    for (const proj of entities.projectiles) {
      if (!proj.active) continue;
      if (this.hitBoss(proj, bosses, effects, callbacks)) continue;
      if (this.hitFlying(proj, entities.enemies, effects, economy, callbacks)) continue;
      if (this.hitGround(proj, entities.groundEnemies, effects, economy, callbacks)) continue;
      if (this.hitBomb(proj, entities, effects, economy, callbacks)) continue;
      this.hitDropPod(proj, entities, effects, economy, callbacks);
    }
  }

  private consumeProjectile(proj: ProjectileState): void {
    proj.active = false;
    projectilePool.release(proj);
  }

  private hitBoss(
    proj: ProjectileState,
    bosses: BossManager | null,
    effects: EffectsManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    if (!bosses?.isActive() || !bosses.boss) return false;
    const result = bosses.applyProjectileHit(
      bosses.boss,
      proj.x,
      proj.y,
      proj.radius,
      proj.damage,
      effects,
      callbacks.onScreenShake,
    );
    if (!result.hit) return false;
    callbacks.onHit?.();
    this.consumeProjectile(proj);
    return true;
  }

  private hitFlying(
    proj: ProjectileState,
    enemies: EnemyState[],
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const enemy of enemies) {
      if (!enemy.active || enemy.health <= 0) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, enemy.x, enemy.y, enemy.radius)) continue;

      damageEnemy(enemy, proj.damage);
      effects.spawnHitSparks(proj.x, proj.y, enemy.typeId);
      callbacks.onHit?.();
      this.consumeProjectile(proj);

      if (enemy.health <= 0) {
        const def = ENEMY_DEFINITIONS[enemy.typeId];
        const points = economy.registerKill(enemy.scoreValue);
        effects.spawnExplosion(enemy.x, enemy.y, enemy.radius, def.accentColor);
        effects.spawnScorePopup(enemy.x, enemy.y - 20, `+${points}`);
        callbacks.onScreenShake?.(def.shakeOnDeath);
      }
      return true;
    }
    return false;
  }

  private hitGround(
    proj: ProjectileState,
    ground: GroundEnemyState[],
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const g of ground) {
      if (!g.active || g.health <= 0) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, g.x, g.y, g.radius)) continue;

      damageGroundEnemy(g, proj.damage);
      effects.spawnGroundHitSparks(proj.x, proj.y, g.typeId);
      callbacks.onHit?.();
      this.consumeProjectile(proj);

      if (g.health <= 0) {
        const def = GROUND_ENEMY_DEFINITIONS[g.typeId];
        const points = economy.registerKill(g.scoreValue);
        effects.spawnExplosion(g.x, g.y, g.radius, def.accentColor);
        effects.spawnScorePopup(g.x, g.y - 16, `+${points}`);
        callbacks.onScreenShake?.(def.shakeOnDeath);
        g.active = false;
      }
      return true;
    }
    return false;
  }

  private hitBomb(
    proj: ProjectileState,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const b of entities.bombs) {
      if (!b.active) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, b.x, b.y, b.radius)) continue;

      damageBomb(b, proj.damage);
      effects.spawnHitSparks(proj.x, proj.y, 'bomber_ship');
      callbacks.onHit?.();
      this.consumeProjectile(proj);

      if (b.health <= 0) {
        const points = economy.registerKill(b.scoreValue);
        effects.spawnExplosion(b.x, b.y, b.radius * 1.5, '#ffaa00');
        effects.spawnScorePopup(b.x, b.y - 12, `+${points}`);
        entities.releaseBomb(b);
        callbacks.onScreenShake?.(3);
      }
      return true;
    }
    return false;
  }

  private hitDropPod(
    proj: ProjectileState,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const p of entities.dropPods) {
      if (!p.active) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, p.x, p.y, p.radius)) continue;

      damageDropPod(p, proj.damage);
      effects.spawnHitSparks(proj.x, proj.y, 'drop_carrier');
      callbacks.onHit?.();
      this.consumeProjectile(proj);

      if (p.health <= 0) {
        const points = economy.registerKill(p.scoreValue);
        effects.spawnExplosion(p.x, p.y, p.radius, '#52b788');
        effects.spawnScorePopup(p.x, p.y - 12, `+${points}`);
        entities.releaseDropPod(p);
        callbacks.onScreenShake?.(2);
      }
      return true;
    }
    return false;
  }
}
