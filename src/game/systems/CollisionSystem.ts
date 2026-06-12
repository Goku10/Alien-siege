import { BALANCING } from '../data/balancing';
import { MOTHERSHIP_BOSS } from '../data/bossConfig';
import { getKillCredits } from '../data/credits';
import { ENEMY_DEFINITIONS } from '../data/enemies';
import { GROUND_ENEMY_DEFINITIONS } from '../data/groundEnemies';
import { damageBomb } from '../entities/Bomb';
import { damageDropPod } from '../entities/DropPod';
import { damageEnemy } from '../entities/Enemy';
import { damageGroundEnemy } from '../entities/GroundEnemy';
import { projectilePool } from '../entities/Projectile';
import type { ProjectileState, SplashBurst } from '../types';
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

function splashDamageAt(distance: number, radius: number, baseDamage: number): number {
  if (radius <= 0) return 0;
  const t = Math.min(1, distance / radius);
  return Math.max(1, Math.floor(baseDamage * (1 - t * 0.55)));
}

function maybeHeavyHitShake(
  maxHealth: number,
  callbacks: CollisionCallbacks,
): void {
  if (maxHealth >= BALANCING.effects.heavyHitHealthThreshold) {
    callbacks.onScreenShake?.(BALANCING.effects.heavyHitShake);
  }
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
      this.resolveProjectile(proj, entities, effects, economy, bosses, callbacks);
    }
  }

  processSplashBursts(
    bursts: SplashBurst[],
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    bosses: BossManager | null,
    callbacks: CollisionCallbacks = {},
  ): void {
    for (const burst of bursts) {
      effects.spawnExplosion(burst.x, burst.y, burst.radius, '#ff6b35');
      callbacks.onScreenShake?.(burst.kind === 'missile' ? 6 : 3);
      this.applySplash(
        burst.x,
        burst.y,
        burst.radius,
        burst.damage,
        entities,
        effects,
        economy,
        bosses,
        callbacks,
      );
    }
  }

  private resolveProjectile(
    proj: ProjectileState,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    bosses: BossManager | null,
    callbacks: CollisionCallbacks,
  ): void {
    while (proj.active) {
      if (this.tryHitBoss(proj, bosses, entities, effects, economy, callbacks)) {
        if (!this.continueAfterHit(proj)) break;
        continue;
      }
      if (this.tryHitFlying(proj, entities, effects, economy, callbacks)) {
        if (!this.continueAfterHit(proj)) break;
        continue;
      }
      if (this.tryHitGround(proj, entities, effects, economy, callbacks)) {
        if (!this.continueAfterHit(proj)) break;
        continue;
      }
      if (this.tryHitBomb(proj, entities, effects, economy, callbacks)) {
        if (!this.continueAfterHit(proj)) break;
        continue;
      }
      if (this.tryHitDropPod(proj, entities, effects, economy, callbacks)) {
        if (!this.continueAfterHit(proj)) break;
        continue;
      }
      break;
    }
  }

  private continueAfterHit(proj: ProjectileState): boolean {
    if (proj.pierceRemaining > 0) {
      proj.pierceRemaining -= 1;
      return true;
    }
    this.consumeProjectile(proj);
    return false;
  }

  private consumeProjectile(proj: ProjectileState): void {
    proj.active = false;
    projectilePool.release(proj);
  }

  private tryHitBoss(
    proj: ProjectileState,
    bosses: BossManager | null,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
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
    if (proj.splashRadius > 0) {
      effects.spawnExplosion(proj.x, proj.y, proj.splashRadius * 0.65, proj.glowColor);
      this.applySplash(
        proj.x,
        proj.y,
        proj.splashRadius,
        proj.damage,
        entities,
        effects,
        economy,
        null,
        callbacks,
      );
    }
    return true;
  }

  private tryHitFlying(
    proj: ProjectileState,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const enemy of entities.enemies) {
      if (!enemy.active || enemy.health <= 0) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, enemy.x, enemy.y, enemy.radius)) continue;

      damageEnemy(enemy, proj.damage);
      const def = ENEMY_DEFINITIONS[enemy.typeId];
      const heavy = enemy.maxHealth >= BALANCING.effects.heavyHitHealthThreshold;
      effects.spawnHitSparks(proj.x, proj.y, enemy.typeId, heavy);
      callbacks.onHit?.();
      if (enemy.health > 0) maybeHeavyHitShake(enemy.maxHealth, callbacks);
      this.maybeSplash(proj, enemy.x, enemy.y, enemy.id, entities, economy, effects, callbacks);

      if (enemy.health <= 0) {
        const reward = economy.registerKill(
          enemy.scoreValue,
          getKillCredits(enemy.typeId),
        );
        effects.spawnKillFeedback(
          enemy.x,
          enemy.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          def.accentColor,
          enemy.radius,
          heavy,
        );
        callbacks.onScreenShake?.(def.shakeOnDeath);
      }
      return true;
    }
    return false;
  }

  private tryHitGround(
    proj: ProjectileState,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    callbacks: CollisionCallbacks,
  ): boolean {
    for (const g of entities.groundEnemies) {
      if (!g.active || g.health <= 0) continue;
      if (!circleHit(proj.x, proj.y, proj.radius, g.x, g.y, g.radius)) continue;

      damageGroundEnemy(g, proj.damage);
      const gDef = GROUND_ENEMY_DEFINITIONS[g.typeId];
      const gHeavy = g.maxHealth >= BALANCING.effects.heavyHitHealthThreshold;
      effects.spawnGroundHitSparks(proj.x, proj.y, g.typeId);
      callbacks.onHit?.();
      if (g.health > 0) maybeHeavyHitShake(g.maxHealth, callbacks);
      this.maybeSplash(proj, g.x, g.y, g.id, entities, economy, effects, callbacks);

      if (g.health <= 0) {
        const reward = economy.registerKill(
          g.scoreValue,
          getKillCredits(g.typeId),
        );
        effects.spawnKillFeedback(
          g.x,
          g.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          gDef.accentColor,
          g.radius,
          gHeavy,
        );
        callbacks.onScreenShake?.(gDef.shakeOnDeath);
        g.active = false;
      }
      return true;
    }
    return false;
  }

  private tryHitBomb(
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
      this.maybeSplash(proj, b.x, b.y, b.id, entities, economy, effects, callbacks);

      if (b.health <= 0) {
        const reward = economy.registerKill(
          b.scoreValue,
          getKillCredits('bomb'),
        );
        effects.spawnKillFeedback(
          b.x,
          b.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          '#ffaa00',
          b.radius * 1.5,
          false,
        );
        entities.releaseBomb(b);
        callbacks.onScreenShake?.(3);
      }
      return true;
    }
    return false;
  }

  private tryHitDropPod(
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
      this.maybeSplash(proj, p.x, p.y, p.id, entities, economy, effects, callbacks);

      if (p.health <= 0) {
        const reward = economy.registerKill(
          p.scoreValue,
          getKillCredits('pod'),
        );
        effects.spawnKillFeedback(
          p.x,
          p.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          '#52b788',
          p.radius,
          false,
        );
        entities.releaseDropPod(p);
        callbacks.onScreenShake?.(2);
      }
      return true;
    }
    return false;
  }

  private maybeSplash(
    proj: ProjectileState,
    hitX: number,
    hitY: number,
    directId: number,
    entities: EntityManager,
    economy: EconomyManager,
    effects: EffectsManager,
    callbacks: CollisionCallbacks,
  ): void {
    if (proj.splashRadius <= 0) return;
    effects.spawnExplosion(hitX, hitY, proj.splashRadius * 0.65, proj.glowColor);
    this.applySplash(
      hitX,
      hitY,
      proj.splashRadius,
      proj.damage,
      entities,
      effects,
      economy,
      null,
      callbacks,
      directId,
    );
  }

  private applySplash(
    x: number,
    y: number,
    radius: number,
    baseDamage: number,
    entities: EntityManager,
    effects: EffectsManager,
    economy: EconomyManager,
    bosses: BossManager | null,
    callbacks: CollisionCallbacks,
    excludeId?: number,
  ): void {
    if (bosses?.isActive() && bosses.boss) {
      const boss = bosses.boss;
      const dist = Math.hypot(x - boss.x, y - boss.y);
      if (dist <= radius + MOTHERSHIP_BOSS.bodyRadius * 0.5) {
        bosses.applyProjectileHit(
          boss,
          x,
          y,
          radius,
          splashDamageAt(dist, radius, baseDamage),
          effects,
          callbacks.onScreenShake,
        );
        callbacks.onHit?.();
      }
    }

    for (const enemy of entities.enemies) {
      if (!enemy.active || enemy.health <= 0 || enemy.id === excludeId) continue;
      const dist = Math.hypot(x - enemy.x, y - enemy.y);
      if (dist > radius + enemy.radius) continue;
      const dmg = splashDamageAt(dist, radius, baseDamage);
      damageEnemy(enemy, dmg);
      callbacks.onHit?.();
      if (enemy.health <= 0) {
        const def = ENEMY_DEFINITIONS[enemy.typeId];
        const reward = economy.registerKill(enemy.scoreValue, getKillCredits(enemy.typeId));
        effects.spawnKillFeedback(
          enemy.x,
          enemy.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          def.accentColor,
          enemy.radius,
          enemy.maxHealth >= BALANCING.effects.heavyHitHealthThreshold,
        );
        callbacks.onScreenShake?.(def.shakeOnDeath * 0.6);
      }
    }

    for (const g of entities.groundEnemies) {
      if (!g.active || g.health <= 0 || g.id === excludeId) continue;
      const dist = Math.hypot(x - g.x, y - g.y);
      if (dist > radius + g.radius) continue;
      damageGroundEnemy(g, splashDamageAt(dist, radius, baseDamage));
      callbacks.onHit?.();
      if (g.health <= 0) {
        const gDef = GROUND_ENEMY_DEFINITIONS[g.typeId];
        const reward = economy.registerKill(g.scoreValue, getKillCredits(g.typeId));
        effects.spawnKillFeedback(
          g.x,
          g.y,
          reward.score,
          reward.credits,
          reward.combo,
          reward.comboIncreased,
          gDef.accentColor,
          g.radius,
          false,
        );
        g.active = false;
      }
    }

    for (const b of entities.bombs) {
      if (!b.active || b.id === excludeId) continue;
      const dist = Math.hypot(x - b.x, y - b.y);
      if (dist > radius + b.radius) continue;
      damageBomb(b, splashDamageAt(dist, radius, baseDamage));
      callbacks.onHit?.();
    }

    for (const p of entities.dropPods) {
      if (!p.active || p.id === excludeId) continue;
      const dist = Math.hypot(x - p.x, y - p.y);
      if (dist > radius + p.radius) continue;
      damageDropPod(p, splashDamageAt(dist, radius, baseDamage));
      callbacks.onHit?.();
    }
  }
}
